import { errorResponse, ApiError } from "@/lib/server/errors";
import { getPapersByIds, searchPapers } from "@/lib/server/arxiv";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");
    const query = searchParams.get("query");
    if (ids) return Response.json(await getPapersByIds(ids.split(",").map((id) => id.trim()).filter(Boolean)));
    if (query) return Response.json(await searchPapers(query));
    throw new ApiError("Either query or ids parameter is required", 422, "VALIDATION_ERROR");
  } catch (error) {
    return errorResponse(error);
  }
}
