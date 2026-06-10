import { auth, clerkClient } from "@clerk/nextjs/server";
import { ApiError } from "./errors";
import { ensureBackendSchema, getDb, getUsersIdColumnType } from "./db";
import type { UserRecord } from "./types";

async function upsertUserFromClerk(clerkUserId: string): Promise<UserRecord> {
  await ensureBackendSchema();
  const sql = getDb();
  const existing = await sql<UserRecord[]>`SELECT * FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`;
  if (existing[0]) return existing[0];

  const clerk = await clerkClient();
  const profile = await clerk.users.getUser(clerkUserId);
  const email = profile.primaryEmailAddress?.emailAddress || `${clerkUserId}@litxplore.generated`;
  const usersIdType = await getUsersIdColumnType(sql);

  if (usersIdType === "integer") {
    const created = await sql<UserRecord[]>`
      INSERT INTO users (clerk_id, email, first_name, last_name, is_active, created_at, updated_at)
      VALUES (${clerkUserId}, ${email}, ${profile.firstName}, ${profile.lastName}, true, NOW(), NOW())
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW()
      RETURNING *
    `;
    return created[0];
  }

  const created = await sql<UserRecord[]>`
    INSERT INTO users (id, clerk_id, email, first_name, last_name, is_active, created_at, updated_at)
    VALUES (${clerkUserId}, ${clerkUserId}, ${email}, ${profile.firstName}, ${profile.lastName}, true, NOW(), NOW())
    ON CONFLICT (clerk_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW()
    RETURNING *
  `;
  return created[0];
}

export async function requireUser(): Promise<UserRecord> {
  const { userId } = await auth();
  if (!userId) throw new ApiError("Authentication required", 401, "MISSING_TOKEN");
  return upsertUserFromClerk(userId);
}

export async function syncUserFromClerk(clerkUserId: string, profile: {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}): Promise<UserRecord> {
  await ensureBackendSchema();
  const sql = getDb();
  const usersIdType = await getUsersIdColumnType(sql);

  if (usersIdType === "integer") {
    const rows = await sql<UserRecord[]>`
      INSERT INTO users (clerk_id, email, first_name, last_name, is_active, created_at, updated_at)
      VALUES (${clerkUserId}, ${profile.email}, ${profile.first_name ?? null}, ${profile.last_name ?? null}, true, NOW(), NOW())
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW()
      RETURNING *
    `;
    return rows[0];
  }

  const rows = await sql<UserRecord[]>`
    INSERT INTO users (id, clerk_id, email, first_name, last_name, is_active, created_at, updated_at)
    VALUES (${clerkUserId}, ${clerkUserId}, ${profile.email}, ${profile.first_name ?? null}, ${profile.last_name ?? null}, true, NOW(), NOW())
    ON CONFLICT (clerk_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0];
}
