import { computeInDepth } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { errorResponse, validatePaperId } from "@/lib/server/errors";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(_request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await requireUser();
    const { paperId } = await params;
    validatePaperId(paperId);
    return Response.json(await computeInDepth(paperId));
  } catch (error) {
    return errorResponse(error);
  }
}
