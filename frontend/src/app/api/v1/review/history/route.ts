import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await requireUser();
    return Response.json(await getDb()`
      SELECT id, title, topic, content, citations, created_at, updated_at
      FROM literature_reviews WHERE user_id = ${user.id} ORDER BY created_at DESC
    `);
  } catch (error) {
    return errorResponse(error);
  }
}
