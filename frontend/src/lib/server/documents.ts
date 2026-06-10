import PDFDocument from "pdfkit";
import type { Paper } from "./types";

export async function generateDocument(content: string, citations: Paper[], topic: string, format: "pdf" | "latex") {
  const references = citations.map((paper, index) =>
    `[${index + 1}] ${paper.authors.join(", ")}. ${paper.title}. (${new Date(paper.published).getFullYear()})${paper.url ? ` ${paper.url}` : ""}`
  ).join("\n\n");
  if (format === "latex") {
    return Buffer.from(`${topic}\n${"=".repeat(topic.length)}\n\nDate: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}\n\n${content}\n\nReferences\n----------\n${references}`);
  }
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(22).text(topic);
    doc.moveDown().fontSize(10).text(new Date().toLocaleDateString("en-US", { dateStyle: "long" }));
    doc.moveDown().fontSize(11).text(content.replace(/^#{1,6}\s+/gm, ""), { lineGap: 4 });
    doc.addPage().fontSize(18).text("References");
    doc.moveDown().fontSize(10).text(references, { lineGap: 4 });
    doc.end();
  });
}
