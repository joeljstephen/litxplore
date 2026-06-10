import { chatWithPaper } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { ApiError, errorResponse, validatePaperId } from "@/lib/server/errors";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await requireUser();
    const { paperId } = await params;
    validatePaperId(paperId);
    const message = new URL(request.url).searchParams.get("message")?.trim();
    if (!message || message.length > 4000) throw new ApiError("Message is required and must be at most 4000 characters", 422, "VALIDATION_ERROR");
    const answer = await chatWithPaper(paperId, message);
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        for (let index = 0; index < answer.length; index += 100) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: answer.slice(index, index + 100), sources: [] })}\n\n`));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error) {
    return errorResponse(error);
  }
}
