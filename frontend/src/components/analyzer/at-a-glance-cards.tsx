"use client";

import { AtAGlanceAnalysis } from "@/lib/types/analysis";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
      {children}
    </span>
  );
}

function BlockHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-border/70 pb-3">
      <span className="h-6 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
      <h3 className="text-base font-bold tracking-tight text-foreground @md:text-lg">
        {children}
      </h3>
    </div>
  );
}

function ProseBlock({ content }: { content: string }) {
  const paragraphs = content
    .replace(/\\n\\n/g, "\n\n")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return (
      <p className="text-[15px] leading-7 text-foreground/90">{content}</p>
    );
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, idx) => (
        <p key={idx} className="text-[15px] leading-7 text-foreground/90">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

interface AnalysisBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: "default" | "muted" | "highlight";
}

function AnalysisBlock({
  title,
  children,
  className,
  accent = "default",
}: AnalysisBlockProps) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-5 @md:p-6 shadow-sm",
        accent === "highlight" && "border-primary/20 bg-primary/[0.03]",
        accent === "muted" && "bg-muted/20",
        className
      )}
    >
      <BlockHeading>{title}</BlockHeading>
      {children}
    </article>
  );
}

interface BasicInfoCardProps {
  title: string;
  authors: string[];
  affiliations: string[];
}

export function BasicInfoCard({ title, authors, affiliations }: BasicInfoCardProps) {
  return (
    <section className="rounded-2xl border bg-gradient-to-br from-card to-muted/20 p-6 @md:p-8 shadow-sm">
      <h2 className="text-balance border-b border-border/70 pb-4 text-xl font-bold leading-snug tracking-tight @md:text-2xl">
        {title}
      </h2>

      <dl className="mt-6 grid gap-5 @md:grid-cols-2 @md:gap-6">
        <div className="space-y-2">
          <SectionLabel>Authors</SectionLabel>
          <dd className="text-[15px] leading-relaxed text-foreground/90">
            {authors.join(", ")}
          </dd>
        </div>
        {affiliations.length > 0 && (
          <div className="space-y-2">
            <SectionLabel>Affiliations</SectionLabel>
            <dd className="text-[15px] leading-relaxed text-foreground/90">
              {affiliations.join(", ")}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

interface AbstractCardProps {
  abstract: string;
  keywords: string[];
}

export function AbstractCard({ abstract, keywords }: AbstractCardProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 @md:p-8 shadow-sm">
      <BlockHeading>Abstract</BlockHeading>
      <div className="max-w-prose">
        <ProseBlock content={abstract} />
      </div>

      {keywords.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-6">
          <SectionLabel>Keywords</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-2">
            {keywords.map((keyword, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface SectionCardProps {
  title: string;
  content: string;
}

export function SectionCard({ title, content }: SectionCardProps) {
  return (
    <AnalysisBlock title={title}>
      <ProseBlock content={content} />
    </AnalysisBlock>
  );
}

interface ListSectionCardProps {
  title: string;
  items: string[];
}

export function ListSectionCard({ title, items }: ListSectionCardProps) {
  return (
    <AnalysisBlock title={title}>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-[15px] leading-7 text-foreground/90">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </AnalysisBlock>
  );
}

interface AtAGlanceCardsProps {
  analysis: AtAGlanceAnalysis;
}

export function AtAGlanceCards({ analysis }: AtAGlanceCardsProps) {
  const sections = [
    { type: "text" as const, title: "Introduction", content: analysis.introduction },
    { type: "text" as const, title: "Related Work", content: analysis.related_work },
    {
      type: "text" as const,
      title: "Problem Statement",
      content: analysis.problem_statement,
    },
    { type: "text" as const, title: "Methodology", content: analysis.methodology },
    { type: "text" as const, title: "Results", content: analysis.results },
    { type: "text" as const, title: "Discussion", content: analysis.discussion },
    { type: "list" as const, title: "Limitations", items: analysis.limitations },
    { type: "list" as const, title: "Future Work", items: analysis.future_work },
    { type: "text" as const, title: "Conclusion", content: analysis.conclusion },
  ];

  return (
    <div className="@container mx-auto w-full max-w-5xl space-y-6 pb-6">
      <BasicInfoCard
        title={analysis.title}
        authors={analysis.authors}
        affiliations={analysis.affiliations}
      />

      <AbstractCard abstract={analysis.abstract} keywords={analysis.keywords} />

      <div className="space-y-5">
        <div className="flex items-center gap-3 px-1">
          <span className="h-7 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Paper breakdown
          </h3>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @lg:gap-5">
          {sections.map((section) =>
            section.type === "list" ? (
              <ListSectionCard
                key={section.title}
                title={section.title}
                items={section.items}
              />
            ) : (
              <SectionCard
                key={section.title}
                title={section.title}
                content={section.content}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
