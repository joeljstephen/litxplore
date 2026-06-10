import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ApiError, errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function DELETE(_request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const user = await requireUser();
    const { reviewId } = await params;
    const rows = await getDb()<Array<{ id: number }>>`
      DELETE FROM literature_reviews WHERE id = ${Number(reviewId)} AND user_id = ${user.id} RETURNING id
    `;
    if (!rows[0]) throw new ApiError("Review not found", 404, "NOT_FOUND");
    return Response.json({ message: "Review deleted successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}
