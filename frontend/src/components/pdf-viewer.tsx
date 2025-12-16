"use client";

interface PDFViewerProps {
  url: string | null | undefined;
}

export function PDFViewer({ url }: PDFViewerProps) {
  // Handle null/undefined URL
  if (!url) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted">
        <p className="text-muted-foreground">No PDF available</p>
      </div>
    );
  }

  // Determine the correct URL based on the source
  let pdfUrl: string;
  
  if (url.startsWith("/uploads/")) {
    // Uploaded PDF - construct full backend URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    pdfUrl = `${apiUrl}${url}`;
  } else if (url.startsWith("http://") || url.startsWith("https://")) {
    // External URL (arXiv) - use as is
    pdfUrl = url;
  } else {
    // Fallback for other cases
    pdfUrl = url.startsWith("https://") ? url : `https://${url}`;
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-full"
      style={{
        height: "100%",
        display: "block",
      }}
    />
  );
}
