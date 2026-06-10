import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code = "INTERNAL_ERROR",
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(error instanceof Error ? error.message : "Internal server error");
  if (apiError.status >= 500 && apiError.code !== "UPLOADS_DISABLED") {
    console.error(error);
  }

  return NextResponse.json(
    {
      status: "error",
      error: {
        code: apiError.code,
        message: apiError.message,
        status_code: apiError.status,
        ...(apiError.details ? { details: apiError.details } : {}),
      },
    },
    { status: apiError.status }
  );
}

export function validatePaperId(paperId: string) {
  const upload = /^upload_[0-9a-f]{10}$/i;
  const arxiv = /^(?:[a-z-]+\/\d{7}|\d{4}\.\d{4,5}(?:v\d+)?)$/i;
  if (!upload.test(paperId) && !arxiv.test(paperId)) {
    throw new ApiError("Invalid paper ID format", 422, "VALIDATION_ERROR");
  }
}
