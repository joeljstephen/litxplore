import { NextRequest } from "next/server";
import { chatWithPaper } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";

// Remove edge runtime to support streaming from backend
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, paperId } = await req.json();

    if (!paperId) {
      return new Response("Paper ID is required", { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("No user message found", { status: 400 });
    }

    await requireUser();
    const answer = await chatWithPaper(paperId, lastMessage.content);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        for (let index = 0; index < answer.length; index += 100) {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(answer.slice(index, index + 100))}\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
