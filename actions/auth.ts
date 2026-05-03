"use server";

import { redirect } from "next/navigation";

import { createSession, destroySession, getRoleHome, getUserByEmail, hashPassword, toSessionUser, verifyPassword } from "@/lib/auth";
import { execute } from "@/lib/db";
import { idleFormState, loginSchema, registerSchema, validationErrorState } from "@/lib/validation";

export async function registerAction(_: typeof idleFormState, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const existingUser = await getUserByEmail(parsed.data.email);
  if (existingUser) {
    return {
      status: "error" as const,
      message: "An account with that email already exists.",
      fieldErrors: {
        email: ["Use a different email address."]
      }
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const result = await execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [parsed.data.name, parsed.data.email, passwordHash, parsed.data.role]
  );

  const user = {
    id: Number(result.insertId),
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role
  };

  await createSession(user);
  redirect(getRoleHome(parsed.data.role));
}

export async function loginAction(_: typeof idleFormState, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user) {
    return {
      status: "error" as const,
      message: "We could not find an account with those details."
    };
  }

  const matches = await verifyPassword(parsed.data.password, user.password_hash);
  if (!matches) {
    return {
      status: "error" as const,
      message: "The password you entered is incorrect."
    };
  }

  await createSession(toSessionUser(user));
  redirect(getRoleHome(user.role));
}

export async function logoutAction() {
  await destroySession();
  redirect("/?notice=signed-out");
}
