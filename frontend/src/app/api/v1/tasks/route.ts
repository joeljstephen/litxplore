import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse } from "@/lib/server/errors";
import type { TaskRecord } from "@/lib/server/types";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);
    const rows = status
      ? await getDb()<TaskRecord[]>`SELECT id, status, error_message, created_at, result_data FROM tasks WHERE user_id = ${user.id} AND status = ${status} ORDER BY created_at DESC LIMIT ${limit}`
      : await getDb()<TaskRecord[]>`SELECT id, status, error_message, created_at, result_data FROM tasks WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT ${limit}`;
    return Response.json(rows.map((task) => ({
      ...task,
      result_data: typeof task.result_data === "string" ? JSON.parse(task.result_data) : task.result_data,
    })));
  } catch (error) {
    return errorResponse(error);
  }
}
