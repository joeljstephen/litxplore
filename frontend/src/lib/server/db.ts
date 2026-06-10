import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;
let schemaPromise: Promise<void> | null = null;

export type UsersIdType = "integer" | "varchar";

export function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL or POSTGRES_URL is required");
  if (!client) client = postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 10 });
  return client;
}

export async function getUsersIdColumnType(
  sql: ReturnType<typeof postgres> = getDb()
): Promise<UsersIdType | null> {
  const rows = await sql<Array<{ data_type: string }>>`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return ["integer", "bigint", "smallint"].includes(rows[0].data_type) ? "integer" : "varchar";
}

export function ensureBackendSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getDb();
      let usersIdType = await getUsersIdColumnType(sql);

      if (!usersIdType) {
        await sql`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            clerk_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `;
        usersIdType = "varchar";
      }

      const userIdCol = usersIdType === "integer" ? "INTEGER" : "VARCHAR(255)";

      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS literature_reviews (
          id SERIAL PRIMARY KEY,
          user_id ${userIdCol} REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          topic VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          citations TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(36) PRIMARY KEY,
          user_id ${userIdCol} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          result_data TEXT,
          error_message TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS uploaded_papers (
          content_hash VARCHAR(10) PRIMARY KEY,
          user_id ${userIdCol} REFERENCES users(id) ON DELETE CASCADE,
          filename VARCHAR(500) NOT NULL,
          title VARCHAR(500) NOT NULL,
          authors JSONB NOT NULL DEFAULT '[]'::jsonb,
          summary TEXT NOT NULL DEFAULT '',
          pdf_data BYTEA NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await sql`
        CREATE TABLE IF NOT EXISTS paper_analyses (
          cache_key VARCHAR(255) PRIMARY KEY,
          analysis JSONB NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS ix_reviews_user_id ON literature_reviews(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS ix_tasks_user_id ON tasks(user_id)`;
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}
