"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  ArrowRight,
  BookOpenCheck,
  MessageSquareText,
  Sparkles,
  Zap,
  FileText,
  BookMarked,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Hero content */}
        <div className="container mx-auto px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-6xl font-bold mb-6 text-foreground tracking-tight">
              LitXplore
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Your AI-powered research companion for deep paper analysis and
              comprehensive literature review generation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-xl px-8">
                <Link href="/search" className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" />
                  <span>Analyze Papers</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-8"
              >
                <Link href="/review" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Generate Review</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Layout Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
            Explore
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand research papers and synthesize
            knowledge
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Feature 1 - Paper Analyzer (Primary Feature) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-8 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <MessageSquareText className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
                Paper Analyzer
              </h3>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Deep dive into any research paper with comprehensive AI-powered
                analysis:
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      At-a-Glance Summary:
                    </strong>{" "}
                    Instant overview of key contributions, methodology, and
                    results
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      In-Depth Analysis:
                    </strong>{" "}
                    Detailed breakdown of all major sections including
                    methodology, limitations, and future work
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      Interactive Chat:
                    </strong>{" "}
                    Ask questions and get contextual answers from the paper
                    content
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Key Insights:</strong>{" "}
                    Explore figures, limitations, and future research directions
                  </span>
                </li>
              </ul>

              <Button asChild size="lg" className="rounded-xl">
                <Link href="/search" className="flex items-center gap-2">
                  <span>Start Analyzing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
              <BookMarked className="h-48 w-48" />
            </div> */}
          </motion.div>

          {/* Feature 2 - Literature Review Generation (Primary Feature) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-8 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <BookOpenCheck className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
                Literature Review Generation
              </h3>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Transform hours of reading into comprehensive, well-structured
                reviews:
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      Smart Paper Selection:
                    </strong>{" "}
                    Search and select relevant papers from arXiv on your
                    research topic
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      AI-Powered Synthesis:
                    </strong>{" "}
                    Automatically analyze and synthesize findings across
                    multiple papers
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      Academic Format:
                    </strong>{" "}
                    Generate well-structured reviews with proper citations and
                    references
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Save & Export:</strong>{" "}
                    Keep your reviews organized and export them for your
                    research
                  </span>
                </li>
              </ul>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl"
              >
                <Link href="/review" className="flex items-center gap-2">
                  <span>Generate Review</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
              <FileText className="h-48 w-48" />
            </div>
          </motion.div>
        </div>

        {/* Supporting Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Paper Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-8 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <Search className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
                Extensive Paper Database
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Search through millions of academic papers on arXiv across all
                scientific disciplines
              </p>
            </div>

            {/* <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
              <Search className="h-32 w-32" />
            </div> */}
          </motion.div>

          {/* AI-Powered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-8 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
                Advanced AI Models
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Powered by state-of-the-art language models for accurate
                analysis and natural conversations
              </p>
            </div>

            {/* <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
              <Sparkles className="h-32 w-32" />
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
            Simple Research Workflow
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From paper discovery to comprehensive understanding in minutes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Search Papers",
              description:
                "Search arXiv for papers on your research topic or upload your own PDF",
              icon: Search,
              delay: 0,
            },
            {
              step: "2",
              title: "Analyze or Review",
              description:
                "Get deep insights from individual papers or generate a comprehensive literature review",
              icon: Sparkles,
              delay: 0.1,
            },
            {
              step: "3",
              title: "Explore & Export",
              description:
                "Chat with papers, explore findings, and export your reviews for your research",
              icon: BookOpen,
              delay: 0.2,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: item.delay }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl mb-4 bg-primary/10 flex items-center justify-center border border-primary/20">
                <item.icon className="h-10 w-10 text-primary" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">
                STEP {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
