const mysql = require("mysql2/promise");

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
    database,
    socketPath,
    multipleStatements: true
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS contact_tickets (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS e_ticket_cards (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      card_number CHAR(16) NOT NULL UNIQUE,
      status ENUM('active', 'expired') NOT NULL DEFAULT 'active',
      issued_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_e_ticket_cards_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
    );
  `);

  const [bookingColumns] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'e_ticket_card_id'
    `,
    [database]
  );

  if (!bookingColumns.length) {
    await connection.query(`
      ALTER TABLE bookings
      ADD COLUMN e_ticket_card_id BIGINT UNSIGNED NULL AFTER attendee_id,
      ADD CONSTRAINT fk_bookings_e_ticket_card
        FOREIGN KEY (e_ticket_card_id) REFERENCES e_ticket_cards (id)
        ON DELETE CASCADE
    `);
  }

  const indexStatements = [
    "CREATE INDEX idx_tickets_status ON contact_tickets (status, created_at)",
    "CREATE INDEX idx_e_ticket_cards_user_status ON e_ticket_cards (user_id, status, expires_at)",
    "CREATE INDEX idx_bookings_e_ticket_card ON bookings (e_ticket_card_id)"
  ];

  for (const statement of indexStatements) {
    try {
      await connection.query(statement);
    } catch {
      // Index already exists - safe to ignore.
    }
  }

  console.log("Migration complete: contact tickets and e-ticket cards ready.");
  await connection.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
