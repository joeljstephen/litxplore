import { requireUser } from "@/lib/server/auth";
import { generateDocument } from "@/lib/server/documents";
import { ApiError, errorResponse } from "@/lib/server/errors";
import type { Paper } from "@/lib/server/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await request.json() as { content?: string; citations?: Paper[]; topic?: string; format?: "pdf" | "latex" };
    if (!body.content?.trim() || !body.topic?.trim() || !body.citations?.length || !["pdf", "latex"].includes(body.format || "")) {
      throw new ApiError("Invalid document request", 422, "VALIDATION_ERROR");
    }
    const format = body.format!;
    const data = await generateDocument(body.content, body.citations, body.topic, format);
    return new Response(data, {
      headers: {
        "Content-Type": format === "pdf" ? "application/pdf" : "application/x-latex",
        "Content-Disposition": `attachment; filename="literature-review.${format}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
