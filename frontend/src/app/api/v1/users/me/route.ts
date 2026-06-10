import { requireUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(await requireUser());
  } catch (error) {
    return errorResponse(error);
  }
}
