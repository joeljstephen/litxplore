import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ApiError, errorResponse } from "@/lib/server/errors";
import type { TaskRecord } from "@/lib/server/types";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await requireUser();
    const { taskId } = await params;
    const rows = await getDb()<TaskRecord[]>`
      SELECT id, status, error_message, created_at, result_data FROM tasks WHERE id = ${taskId} AND user_id = ${user.id} LIMIT 1
    `;
    if (!rows[0]) throw new ApiError("Task not found", 404, "NOT_FOUND");
    return Response.json({
      ...rows[0],
      result_data: typeof rows[0].result_data === "string" ? JSON.parse(rows[0].result_data) : rows[0].result_data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
