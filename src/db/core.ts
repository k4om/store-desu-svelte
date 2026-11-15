import { Pool } from "pg";

export class DBError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "ALREADY_EXISTS" | "DATABASE_ERROR" | "a",
  ) {
    super(code);
    this.name = "DatabaseError";
  }

  public static NotFound = new DBError("NOT_FOUND");
  public static AlreadyExist = new DBError("ALREADY_EXISTS");
  public static DatabaseError = new DBError("DATABASE_ERROR");
}

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}


pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});