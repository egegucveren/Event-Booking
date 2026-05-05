// Database module: creates a shared MySQL connection pool and exposes helpers
// for running queries, executing write statements, and handling transactions.
import mysql, { type PoolConnection, type ResultSetHeader } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __pulsepassPool: ReturnType<typeof mysql.createPool> | undefined;
}

// Throws a clear error at startup if a required environment variable is missing.
function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const pool =
  global.__pulsepassPool ??
  mysql.createPool({
    host: process.env.DB_SOCKET ? undefined : requireEnv("DB_HOST"),
    port: process.env.DB_SOCKET ? undefined : Number(process.env.DB_PORT ?? 3306),
    user: requireEnv("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: requireEnv("DB_NAME"),
    socketPath: process.env.DB_SOCKET || undefined,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false
  });

if (process.env.NODE_ENV !== "production") {
  global.__pulsepassPool = pool;
}

// Runs a SELECT query and returns the result rows typed as T.
export async function query<T>(sql: string, values: any[] = []) {
  const [rows] = await pool.query(sql, values);
  return rows as T;
}

// Runs an INSERT, UPDATE or DELETE statement and returns the result header.
export async function execute(sql: string, values: any[] = []) {
  const [result] = await pool.execute<ResultSetHeader>(sql, values);
  return result;
}

// Wraps multiple queries in a single transaction. Rolls back automatically on error.
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export { pool };
