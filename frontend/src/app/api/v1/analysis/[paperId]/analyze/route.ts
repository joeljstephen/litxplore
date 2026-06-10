import { analyzePaper } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { errorResponse, validatePaperId } from "@/lib/server/errors";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await requireUser();
    const { paperId } = await params;
    validatePaperId(paperId);
    return Response.json(await analyzePaper(paperId, new URL(request.url).searchParams.get("force_refresh") === "true"));
  } catch (error) {
    return errorResponse(error);
  }
}
