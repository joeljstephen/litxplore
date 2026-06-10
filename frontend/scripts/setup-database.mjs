import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL or POSTGRES_URL is required");

const sql = postgres(url, { max: 1, connect_timeout: 10 });
try {
  const migration = await readFile(new URL("../db/001-nextjs-backend.sql", import.meta.url), "utf8");
  await sql.unsafe(migration);
  console.log("LitXplore database schema is ready.");
} finally {
  await sql.end();
}
