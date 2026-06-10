import { parseStringPromise } from "xml2js";
import { ApiError } from "./errors";
import type { Paper } from "./types";

const API = "https://export.arxiv.org/api/query";

function text(value: unknown): string {
  if (Array.isArray(value)) return text(value[0]);
  if (typeof value === "object" && value && "_" in value) return String((value as { _: unknown })._);
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function entryToPaper(entry: Record<string, unknown>): Paper {
  const links = (entry.link || []) as Array<{ $?: { title?: string; href?: string; type?: string } }>;
  const pdf = links.find((link) => link.$?.title === "pdf" || link.$?.type === "application/pdf");
  return {
    id: text(entry.id).split("/").pop()!.replace(/v\d+$/, ""),
    title: text(entry.title),
    authors: ((entry.author || []) as Array<{ name?: unknown }>).map((author) => text(author.name)),
    summary: text(entry.summary),
    published: new Date(text(entry.published)).toISOString(),
    url: (pdf?.$?.href || text(entry.id).replace("/abs/", "/pdf/")).replace(/^http:/, "https:"),
  };
}

async function queryArxiv(params: URLSearchParams): Promise<Paper[]> {
  const response = await fetch(`${API}?${params}`, {
    headers: { "User-Agent": "LitXplore/1.0 (https://litxplore.win)" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new ApiError("arXiv service unavailable", 502, "EXTERNAL_SERVICE_ERROR");
  const parsed = await parseStringPromise(await response.text());
  return ((parsed.feed?.entry || []) as Record<string, unknown>[]).map(entryToPaper);
}

export async function searchPapers(query: string) {
  if (!query.trim()) return [];
  return queryArxiv(new URLSearchParams({ search_query: `all:${query.trim()}`, start: "0", max_results: "10" }));
}

export async function getPapersByIds(ids: string[]) {
  if (!ids.length) return [];
  return queryArxiv(new URLSearchParams({ id_list: ids.join(","), max_results: String(ids.length) }));
}

export async function getPaper(id: string) {
  const papers = await getPapersByIds([id]);
  if (!papers[0]) throw new ApiError("Paper not found", 404, "NOT_FOUND", { paper_id: id });
  return papers[0];
}

export async function fetchPaperPdf(paper: Paper) {
  if (!paper.url || !/^https:\/\/(export\.|www\.)?arxiv\.org\//.test(paper.url)) {
    throw new ApiError("Invalid PDF source", 400, "VALIDATION_ERROR");
  }
  const response = await fetch(paper.url);
  if (!response.ok) throw new ApiError("Failed to fetch paper PDF", 502, "EXTERNAL_SERVICE_ERROR");
  return Buffer.from(await response.arrayBuffer());
}
