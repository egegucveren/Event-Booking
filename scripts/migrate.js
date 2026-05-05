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
  `);

  try {
    await connection.query(`
      CREATE INDEX idx_tickets_status ON contact_tickets (status, created_at)
    `);
  } catch {
    // Index already exists — safe to ignore.
  }

  console.log("Migration complete: contact_tickets table ready.");
  await connection.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
