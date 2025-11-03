"use client";

import { InDepthAnalysis } from "@/lib/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InDepthPanelProps {
  analysis: InDepthAnalysis;
}

export function InDepthPanel({ analysis }: InDepthPanelProps) {
  return (
    <div className="h-full flex flex-col @container">
      <Tabs defaultValue="introduction" className="flex-1 flex flex-col">
        <TabsList className="!grid w-full grid-cols-1 @xs:grid-cols-2 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-8 gap-1 !h-auto p-1">
          <TabsTrigger
            value="introduction"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Introduction
          </TabsTrigger>
          <TabsTrigger
            value="related-work"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Related Work
          </TabsTrigger>
          <TabsTrigger
            value="problem"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Problem
          </TabsTrigger>
          <TabsTrigger
            value="methodology"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Methodology
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Discussion
          </TabsTrigger>
          <TabsTrigger
            value="limitations"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Limitations
          </TabsTrigger>
          <TabsTrigger
            value="conclusion"
            className="text-xs px-3 py-2.5 whitespace-nowrap"
          >
            Conclusion
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4 overflow-hidden">
          <ScrollArea className="h-full">
            <TabsContent value="introduction" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.introduction
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related-work" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Related Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.related_work
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="problem" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Problem Statement / Research Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.problem_statement
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.methodology
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.results
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.discussion
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limitations" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.limitations
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conclusion" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Conclusion and Future Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.conclusion_future_work
                      .replace(/\\n\\n/g, "\n\n")
                      .split("\n\n")
                      .filter(p => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
