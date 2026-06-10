export const runtime = "nodejs";
export function GET() {
  return Response.json({ status: "healthy", service: "LitXplore Next.js API" });
}
