import { errorResponse } from "@/lib/server/errors";
import { getUploadedPaper } from "@/lib/server/papers";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await params;
    const { data } = await getUploadedPaper(`upload_${hash}`);
    return new Response(data, { headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline" } });
  } catch (error) {
    return errorResponse(error);
  }
}
