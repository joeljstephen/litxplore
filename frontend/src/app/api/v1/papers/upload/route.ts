import { requireUser } from "@/lib/server/auth";
import { errorResponse, ApiError } from "@/lib/server/errors";
import { storeUploadedPaper } from "@/lib/server/papers";
import { PDF_UPLOADS_ENABLED } from "@/lib/features";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    if (!PDF_UPLOADS_ENABLED) {
      throw new ApiError("PDF uploads are temporarily disabled", 503, "UPLOADS_DISABLED");
    }
    const user = await requireUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("No file provided", 422, "VALIDATION_ERROR");
    return Response.json(await storeUploadedPaper(file, user.id));
  } catch (error) {
    return errorResponse(error);
  }
}
