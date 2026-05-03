import mysql, { type ResultSetHeader } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __pulsepassPool: ReturnType<typeof mysql.createPool> | undefined;
}

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

export async function query<T>(sql: string, values: any[] = []) {
  const [rows] = await pool.query(sql, values);
  return rows as T;
}

export async function execute(sql: string, values: any[] = []) {
  const [result] = await pool.execute<ResultSetHeader>(sql, values);
  return result;
}

export { pool };
