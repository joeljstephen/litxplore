import { createCompletedTask, generateReview } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
const requestSchema = z.object({
  paper_ids: z.array(z.string()).min(1).max(20),
  topic: z.string().trim().min(3).max(500),
  max_papers: z.number().int().min(1).max(20).default(10),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid request", 422, "VALIDATION_ERROR");
    const result = await generateReview(parsed.data.paper_ids, parsed.data.topic, parsed.data.max_papers);
    return Response.json(await createCompletedTask(user.id, result));
  } catch (error) {
    return errorResponse(error);
  }
}
