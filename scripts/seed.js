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

  await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
  await connection.query(`CREATE DATABASE \`${database}\`; USE \`${database}\`; ${schema}`);

  await connection.query("DELETE FROM bookings");
  await connection.query("DELETE FROM e_ticket_cards");
  await connection.query("DELETE FROM sessions");
  await connection.query("DELETE FROM events");
  await connection.query("DELETE FROM users");

  const passwordHash = await hashPassword("Passo123!");

  const [userResult] = await connection.execute(
    `
      INSERT INTO users (name, email, password_hash, role, is_owner)
      VALUES
        ('Admin User', 'admin@pulsepass.local', ?, 'admin', 1),
        ('Maya Quinn', 'organiser@pulsepass.local', ?, 'organiser', 0),
        ('Leo Hart', 'attendee@pulsepass.local', ?, 'attendee', 0),
        ('Ava Brooks', 'ava@pulsepass.local', ?, 'attendee', 0),
        ('Noah Reed', 'noah@pulsepass.local', ?, 'attendee', 0),
        ('Sofia Lane', 'sofia@pulsepass.local', ?, 'attendee', 0),
        ('Ethan Stone', 'ethan@pulsepass.local', ?, 'attendee', 0)
    `,
    [passwordHash, passwordHash, passwordHash, passwordHash, passwordHash, passwordHash, passwordHash]
  );

  const organiserId = Number(userResult.insertId) + 1;
  const attendeeId = Number(userResult.insertId) + 2;
  const avaId = Number(userResult.insertId) + 3;
  const noahId = Number(userResult.insertId) + 4;
  const sofiaId = Number(userResult.insertId) + 5;
  const ethanId = Number(userResult.insertId) + 6;

  const [cardResult] = await connection.execute(
    `
      INSERT INTO e_ticket_cards (user_id, card_number, status, issued_at, expires_at)
      VALUES
        (?, 'PPCARD0000000001', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
        (?, 'PPCARD0000000002', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
        (?, 'PPCARD0000000003', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
        (?, 'PPCARD0000000004', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
        (?, 'PPCARD0000000005', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
        (?, 'PPCARD0000000006', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))
    `,
    [attendeeId, avaId, noahId, sofiaId, ethanId, organiserId]
  );

  const attendeeCardId = Number(cardResult.insertId);
  const avaCardId = attendeeCardId + 1;
  const noahCardId = attendeeCardId + 2;
  const sofiaCardId = attendeeCardId + 3;
  const ethanCardId = attendeeCardId + 4;

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
        (?, 'Neon Rooftop Session', 'Music', 'Harbour Deck', 'Dublin', '2026-06-12 19:00:00', '2026-06-12 23:00:00', 4500, 138, 'Live electronica with skyline views and a polished guest check-in flow.', 'An elevated late-evening experience for guests who want crisp production, warm lighting, and a seamless arrival journey. The session blends live electronic sets, a curated tasting bar, and structured attendee support from booking through venue entry.', 'scheduled'),
        (?, 'Founders Sprint Workshop', 'Workshop', 'Mill Studio', 'Cork', '2026-06-20 10:00:00', '2026-06-20 16:00:00', 8900, 48, 'A practical build day for early-stage founders and product teams.', 'This workshop helps organisers run a premium daytime event with real session planning, downloadable materials, and a paced agenda. Attendees leave with a sharper project brief, clearer priorities, and a stronger network.', 'scheduled'),
        (?, 'Sunrise Reset Club', 'Wellness', 'Cliff Pavilion', 'Galway', '2026-07-04 07:30:00', '2026-07-04 10:30:00', 3200, 60, 'Breathwork, mobility, and a social breakfast by the sea.', 'Designed for community-focused event brands, this morning format combines movement, guided breathing, and healthy food service in a compact booking flow that is easy for attendees to understand and easy for organisers to manage.', 'scheduled'),
        (?, 'Limerick Food Trail', 'Food', 'Market Hall', 'Limerick', '2026-07-18 13:00:00', '2026-07-18 17:00:00', 5200, 90, 'A guided afternoon of local tastings, chef demos, and small-batch producers.', 'This food experience brings attendees through a curated tasting route with timed sessions, producer stories, and a relaxed marketplace finish. It is built for simple ticketing, clear capacity planning, and smooth guest flow.', 'scheduled'),
        (?, 'Product Leaders Forum', 'Tech', 'Docklands Hub', 'Dublin', '2026-08-01 09:30:00', '2026-08-01 15:30:00', 7600, 110, 'Talks and roundtables for product, design, and engineering leaders.', 'A focused conference format with practical sessions, panel discussion, and structured networking. Organisers can highlight agenda depth while attendees get a clear reason to reserve a seat early.', 'scheduled')
    `,
    [organiserId, organiserId, organiserId, organiserId, organiserId]
  );

  const firstEventId = Number(eventResult.insertId);

  await connection.execute(
    `
      INSERT INTO bookings (code, event_id, attendee_id, e_ticket_card_id, seats, total_cents, status)
      VALUES
        ('PP-7K4Q9X', ?, ?, ?, 12, 54000, 'confirmed'),
        ('PP-9D3M2A', ?, ?, ?, 8, 36000, 'confirmed'),
        ('PP-5P8T1N', ?, ?, ?, 6, 27000, 'confirmed'),
        ('PP-2M8R1L', ?, ?, ?, 10, 89000, 'confirmed'),
        ('PP-4C6V7B', ?, ?, ?, 7, 62300, 'confirmed'),
        ('PP-8R2L5S', ?, ?, ?, 5, 44500, 'confirmed'),
        ('PP-6H1W9Q', ?, ?, ?, 9, 28800, 'confirmed'),
        ('PP-3N7K5D', ?, ?, ?, 4, 12800, 'confirmed'),
        ('PP-1F8D4J', ?, ?, ?, 11, 57200, 'confirmed'),
        ('PP-9L2P6C', ?, ?, ?, 6, 31200, 'confirmed'),
        ('PP-5T4X8A', ?, ?, ?, 14, 106400, 'confirmed'),
        ('PP-7V1N3M', ?, ?, ?, 8, 60800, 'confirmed')
    `,
    [
      firstEventId,
      attendeeId,
      attendeeCardId,
      firstEventId,
      avaId,
      avaCardId,
      firstEventId,
      noahId,
      noahCardId,
      firstEventId + 1,
      attendeeId,
      attendeeCardId,
      firstEventId + 1,
      sofiaId,
      sofiaCardId,
      firstEventId + 1,
      ethanId,
      ethanCardId,
      firstEventId + 2,
      avaId,
      avaCardId,
      firstEventId + 2,
      sofiaId,
      sofiaCardId,
      firstEventId + 3,
      attendeeId,
      attendeeCardId,
      firstEventId + 3,
      ethanId,
      ethanCardId,
      firstEventId + 4,
      noahId,
      noahCardId,
      firstEventId + 4,
      sofiaId,
      sofiaCardId
    ]
  );

  await connection.end();

  console.log(`Seed complete for database "${database}".`);
  console.log("Accounts:");
  console.log("  admin@pulsepass.local / Passo123!");
  console.log("  organiser@pulsepass.local / Passo123!");
  console.log("  attendee@pulsepass.local / Passo123!");
  console.log("  ava@pulsepass.local / Passo123!");
  console.log("  noah@pulsepass.local / Passo123!");
  console.log("  sofia@pulsepass.local / Passo123!");
  console.log("  ethan@pulsepass.local / Passo123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
