import { getPaper } from "@/lib/server/arxiv";
import { errorResponse, validatePaperId } from "@/lib/server/errors";
import { getUploadedPaper } from "@/lib/server/papers";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    const { paperId } = await params;
    validatePaperId(paperId);
    return Response.json(paperId.startsWith("upload_") ? (await getUploadedPaper(paperId)).paper : await getPaper(paperId));
  } catch (error) {
    return errorResponse(error);
  }
}
