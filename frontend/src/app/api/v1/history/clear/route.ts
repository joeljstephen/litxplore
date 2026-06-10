import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function POST() {
  try {
    const user = await requireUser();
    await getDb()`DELETE FROM literature_reviews WHERE user_id = ${user.id}`;
    return Response.json({ message: "History cleared successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}
