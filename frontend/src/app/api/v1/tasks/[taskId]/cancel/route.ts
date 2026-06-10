import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ApiError, errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await requireUser();
    const { taskId } = await params;
    const rows = await getDb()<Array<{ id: string }>>`
      UPDATE tasks SET status = 'failed', error_message = 'Task cancelled by user'
      WHERE id = ${taskId} AND user_id = ${user.id} AND status IN ('pending', 'running') RETURNING id
    `;
    if (!rows[0]) throw new ApiError("Task cannot be cancelled (not found or already completed)", 400, "VALIDATION_ERROR");
    return Response.json({ message: "Task cancelled successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}
