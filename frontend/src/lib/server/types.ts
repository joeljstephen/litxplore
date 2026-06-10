export interface Paper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  url?: string | null;
}

export interface PaperMetadata {
  paper_id: string;
  title: string;
  authors: string[];
  year?: number | null;
  url?: string | null;
  source: "upload" | "arxiv" | "url";
}

export interface AtAGlanceAnalysis {
  title: string;
  authors: string[];
  affiliations: string[];
  abstract: string;
  keywords: string[];
  introduction: string;
  related_work: string;
  problem_statement: string;
  methodology: string;
  results: string;
  discussion: string;
  limitations: string[];
  future_work: string[];
  conclusion: string;
}

export interface InDepthAnalysis {
  introduction: string;
  related_work: string;
  problem_statement: string;
  methodology: string;
  results: string;
  discussion: string;
  limitations: string;
  conclusion_future_work: string;
}

export interface PaperAnalysis {
  paper: PaperMetadata;
  at_a_glance: AtAGlanceAnalysis;
  in_depth?: InDepthAnalysis | null;
  generated_at: string;
  schema_version: string;
  model_tag: string;
}

export interface UserRecord {
  id: string | number;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaskRecord {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  error_message: string | null;
  created_at: Date;
  result_data: Record<string, unknown> | null;
}
