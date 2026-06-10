import { getCachedAnalysis } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { ApiError, errorResponse, validatePaperId } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await requireUser();
    const { paperId } = await params;
    validatePaperId(paperId);
    const analysis = await getCachedAnalysis(paperId);
    if (!analysis) throw new ApiError("Analysis not found for this paper", 404, "NOT_FOUND");
    return Response.json(analysis);
  } catch (error) {
    return errorResponse(error);
  }
}
