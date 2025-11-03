export type PaperMetadata = {
  paper_id: string;
  title: string;
  authors: string[];
  year?: number;
  url?: string;
  source: "upload" | "arxiv" | "url";
};

export type AtAGlanceAnalysis = {
  // Basic Information
  title: string;
  authors: string[];
  affiliations: string[];
  
  // Abstract & Keywords
  abstract: string;
  keywords: string[];
  
  // Paper Sections (in order)
  introduction: string;
  related_work: string;
  problem_statement: string;
  methodology: string;
  results: string;
  discussion: string;
  limitations: string[];
  future_work: string[];
  conclusion: string;
};

export type InDepthAnalysis = {
  introduction: string;
  related_work: string;
  problem_statement: string;
  methodology: string;
  results: string;
  discussion: string;
  limitations: string;
  conclusion_future_work: string;
};

export type PaperAnalysis = {
  paper: PaperMetadata;
  at_a_glance: AtAGlanceAnalysis;
  in_depth?: InDepthAnalysis | null;
  generated_at: string;
  schema_version: string;
  model_tag: string;
};
