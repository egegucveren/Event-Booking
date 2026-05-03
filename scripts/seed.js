const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");

const mysql = require("mysql2/promise");

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function main() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "event_booking";
  const socketPath = process.env.DB_SOCKET || undefined;

  const connection = await mysql.createConnection({
    host: socketPath ? undefined : host,
    port: socketPath ? undefined : port,
    user,
    password,
    socketPath,
    multipleStatements: true
  });

  const schema = fs.readFileSync(path.join(process.cwd(), "database", "schema.sql"), "utf8");

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`; USE \`${database}\`; ${schema}`);

  await connection.query("DELETE FROM bookings");
  await connection.query("DELETE FROM sessions");
  await connection.query("DELETE FROM events");
  await connection.query("DELETE FROM users");

  const passwordHash = await hashPassword("Passo123!");

  const [userResult] = await connection.execute(
    `
      INSERT INTO users (name, email, password_hash, role)
      VALUES
        ('Admin User', 'admin@pulsepass.local', ?, 'admin'),
        ('Maya Quinn', 'organiser@pulsepass.local', ?, 'organiser'),
        ('Leo Hart', 'attendee@pulsepass.local', ?, 'attendee')
    `,
    [passwordHash, passwordHash, passwordHash]
  );

  const organiserId = Number(userResult.insertId) + 1;
  const attendeeId = Number(userResult.insertId) + 2;

  const [eventResult] = await connection.execute(
    `
      INSERT INTO events (
        organiser_id,
        title,
        category,
        venue,
        city,
        starts_at,
        ends_at,
        price_cents,
        capacity,
        excerpt,
        description,
        status
      )
      VALUES
        (?, 'Neon Rooftop Session', 'Music', 'Harbour Deck', 'Dublin', '2026-06-12 19:00:00', '2026-06-12 23:00:00', 4500, 140, 'Live electronica with skyline views and a polished guest check-in flow.', 'An elevated late-evening experience for guests who want crisp production, warm lighting, and a seamless arrival journey. The session blends live electronic sets, a curated tasting bar, and structured attendee support from booking through venue entry.', 'scheduled'),
        (?, 'Founders Sprint Workshop', 'Workshop', 'Mill Studio', 'Cork', '2026-06-20 10:00:00', '2026-06-20 16:00:00', 8900, 48, 'A practical build day for early-stage founders and product teams.', 'This workshop helps organisers run a premium daytime event with real session planning, downloadable materials, and a paced agenda. Attendees leave with a sharper project brief, clearer priorities, and a stronger network.', 'scheduled'),
        (?, 'Sunrise Reset Club', 'Wellness', 'Cliff Pavilion', 'Galway', '2026-07-04 07:30:00', '2026-07-04 10:30:00', 3200, 60, 'Breathwork, mobility, and a social breakfast by the sea.', 'Designed for community-focused event brands, this morning format combines movement, guided breathing, and healthy food service in a compact booking flow that is easy for attendees to understand and easy for organisers to manage.', 'scheduled')
    `,
    [organiserId, organiserId, organiserId]
  );

  const firstEventId = Number(eventResult.insertId);

  await connection.execute(
    `
      INSERT INTO bookings (code, event_id, attendee_id, seats, total_cents, status)
      VALUES
        ('PP-7K4Q9X', ?, ?, 2, 9000, 'confirmed'),
        ('PP-2M8R1L', ?, ?, 1, 8900, 'confirmed')
    `,
    [firstEventId, attendeeId, firstEventId + 1, attendeeId]
  );

  await connection.end();

  console.log(`Seed complete for database "${database}".`);
  console.log("Accounts:");
  console.log("  admin@pulsepass.local / Passo123!");
  console.log("  organiser@pulsepass.local / Passo123!");
  console.log("  attendee@pulsepass.local / Passo123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
