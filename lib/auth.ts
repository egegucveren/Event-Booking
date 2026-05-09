// Authentication module: password hashing, session management, and role-based access control.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { execute, query } from "@/lib/db";
import type { Role, SessionUser } from "@/lib/types";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "pulsepass_session";
const SESSION_DAYS = 7;

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_owner: number;
  password_hash: string;
};

// Hashes a plain-text password using scrypt with a random salt stored as "salt:hash".
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

// Compares a plain-text password to a stored hash using a timing-safe comparison.
export async function verifyPassword(password: string, storedHash: string) {
  const [salt, savedKey] = storedHash.split(":");
  if (!salt || !savedKey) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const savedBuffer = Buffer.from(savedKey, "hex");

  // timingSafeEqual throws if the two buffers differ in length, so this check must come first.
  if (savedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, derivedKey);
}

// Hashes a session token with SHA-256 before storing it so a leaked DB row cannot be used to hijack a session.
export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Creates a new session: stores a hashed token in the DB and sets a secure HTTP-only cookie.
export async function createSession(user: SessionUser) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await execute("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [
    user.id,
    tokenHash,
    `${expiresAt.toISOString().slice(0, 19).replace("T", " ")}`
  ]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

// Deletes the session from the DB and clears the client cookie.
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await execute("DELETE FROM sessions WHERE token_hash = ?", [hashSessionToken(token)]);
  }

  cookieStore.delete(SESSION_COOKIE);
}

// Reads the session cookie and returns the matching user if the session is valid and not expired.
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const rows = await query<
    Array<{
      id: number;
      name: string;
      email: string;
      role: Role;
      is_owner: number;
    }>
  >(
    `
      SELECT u.id, u.name, u.email, u.role, u.is_owner
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [hashSessionToken(token)]
  );

  const row = rows[0];
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, isOwner: row.is_owner === 1 };
}

// Redirects unauthenticated users to the login page.
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// Redirects users who do not hold one of the allowed roles to their own dashboard.
export async function requireRole(roles: Role | Role[]) {
  const user = await requireUser();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    redirect(getRoleHome(user.role));
  }

  return user;
}

// Returns the default dashboard route for each user role.
export function getRoleHome(role: Role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "organiser":
      return "/organiser";
    case "attendee":
      return "/attendee";
  }
}

export async function getUserByEmail(email: string) {
  const rows = await query<UserRow[]>(
    "SELECT id, name, email, role, is_owner, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] ?? null;
}

export function toSessionUser(user: Pick<UserRow, "id" | "name" | "email" | "role" | "is_owner">): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.is_owner === 1
  };
}
