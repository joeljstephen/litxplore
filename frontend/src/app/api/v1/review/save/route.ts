import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
  title: z.string().trim().min(1).max(255).default("Untitled Review"),
  topic: z.string().trim().min(3).max(500),
  content: z.string().trim().min(1).max(100000),
  citations: z.string().max(200000).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid review", 422, "VALIDATION_ERROR");
    const rows = await getDb()<Array<{ id: number }>>`
      INSERT INTO literature_reviews (user_id, title, topic, content, citations, created_at, updated_at)
      VALUES (${user.id}, ${parsed.data.title}, ${parsed.data.topic}, ${parsed.data.content}, ${parsed.data.citations || null}, NOW(), NOW())
      RETURNING id
    `;
    return Response.json({ message: "Review saved successfully", review_id: rows[0].id });
  } catch (error) {
    return errorResponse(error);
  }
}
