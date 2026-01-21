"use client";

import { AtAGlanceAnalysis } from "@/lib/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BasicInfoCardProps {
  title: string;
  authors: string[];
  affiliations: string[];
}

export function BasicInfoCard({ title, authors, affiliations }: BasicInfoCardProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Authors</p>
          <p className="text-base text-foreground">{authors.join(", ")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Affiliations</p>
          <p className="text-base text-foreground">{affiliations.join(", ")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface AbstractCardProps {
  abstract: string;
  keywords: string[];
}

export function AbstractCard({ abstract, keywords }: AbstractCardProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Abstract</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base leading-relaxed text-foreground">{abstract}</p>
        {keywords.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SectionCardProps {
  title: string;
  content: string;
}

export function SectionCard({ title, content }: SectionCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed text-foreground">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

interface ListSectionCardProps {
  title: string;
  items: string[];
}

export function ListSectionCard({ title, items }: ListSectionCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-base">
              <span className="text-primary font-semibold flex-shrink-0">
                •
              </span>
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface AtAGlanceCardsProps {
  analysis: AtAGlanceAnalysis;
}

export function AtAGlanceCards({ analysis }: AtAGlanceCardsProps) {
  return (
    <div className="@container space-y-4">
      {/* Title, Authors, Affiliations - Always full width */}
      <BasicInfoCard
        title={analysis.title}
        authors={analysis.authors}
        affiliations={analysis.affiliations}
      />

      {/* Abstract and Keywords - Always full width */}
      <AbstractCard
        abstract={analysis.abstract}
        keywords={analysis.keywords}
      />

      {/* Masonry layout for section cards using CSS columns */}
      <div className="columns-1 @md:columns-2 @2xl:columns-3 @4xl:columns-4 gap-4 space-y-4">
        {/* Introduction */}
        <SectionCard title="Introduction" content={analysis.introduction} />

        {/* Related Work */}
        <SectionCard title="Related Work" content={analysis.related_work} />

        {/* Problem Statement / Research Questions */}
        <SectionCard title="Problem Statement / Research Questions" content={analysis.problem_statement} />

        {/* Methodology */}
        <SectionCard title="Methodology" content={analysis.methodology} />

        {/* Results */}
        <SectionCard title="Results" content={analysis.results} />

        {/* Discussion */}
        <SectionCard title="Discussion" content={analysis.discussion} />

        {/* Limitations */}
        <ListSectionCard title="Limitations" items={analysis.limitations} />

        {/* Future Work */}
        <ListSectionCard title="Future Work" items={analysis.future_work} />

        {/* Conclusion */}
        <SectionCard title="Conclusion" content={analysis.conclusion} />
      </div>
    </div>
  );
}
