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
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Simplified gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        {/* Hero content */}
        <div className="relative container mx-auto px-4 pt-32 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge - CSS animation only */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Research Platform
              </span>
            </div>

            <h1 className="text-6xl font-bold mb-6 text-foreground tracking-tight">
              LitXplore
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Transform how you read and understand research papers with AI-driven
              analysis and intelligent literature review generation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow"
              >
                <Link href="/search" className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" />
                  <span>Analyze Papers</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <Link href="/review" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Generate Review</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators - CSS animation only */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>arXiv Integrated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Export Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Layout Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand research papers and synthesize
            knowledge
          </p>
        </motion.div>

        {/* Main Features Grid - simplified animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Feature 1 - Paper Analyzer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="group rounded-3xl bg-gradient-to-br from-primary/8 via-primary/5 to-background border border-primary/15 p-10 relative overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-8 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500">
                <MessageSquareText className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-5 text-foreground tracking-tight">
                Paper Analyzer
              </h3>

              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Deep dive into any research paper with comprehensive AI-powered
                analysis:
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  { title: "At-a-Glance Summary", description: "Instant overview of key contributions, methodology, and results" },
                  { title: "In-Depth Analysis", description: "Detailed breakdown of all major sections including methodology, limitations, and future work" },
                  { title: "Interactive Chat", description: "Ask questions and get contextual answers from the paper content" },
                  { title: "Key Insights", description: "Explore figures, limitations, and future research directions" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0 ring-4 ring-primary/10" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground font-medium">{item.title}:</strong> {item.description}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className="rounded-xl group-hover:bg-primary/90 transition-colors"
              >
                <Link href="/search" className="flex items-center gap-2">
                  <span>Start Analyzing</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Corner accent - improved */}
            <div className="absolute top-0 right-0 w-3/4 h-3/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
              background: 'radial-gradient(circle at top right, rgba(var(--primary), 0.15) 0%, rgba(var(--primary), 0.08) 25%, rgba(var(--primary), 0.02) 50%, transparent 70%)',
              filter: 'blur(8px)'
            }} />
          </motion.div>

          {/* Feature 2 - Literature Review Generation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="group rounded-3xl bg-gradient-to-br from-primary/8 via-primary/5 to-background border border-primary/15 p-10 relative overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-8 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500">
                <BookOpenCheck className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-5 text-foreground tracking-tight">
                Literature Review
              </h3>

              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Transform hours of reading into comprehensive, well-structured
                reviews:
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  { title: "Smart Paper Selection", description: "Search and select relevant papers from arXiv on your research topic" },
                  { title: "AI-Powered Synthesis", description: "Automatically analyze and synthesize findings across multiple papers" },
                  { title: "Academic Format", description: "Generate well-structured reviews with proper citations and references" },
                  { title: "Save & Export", description: "Keep your reviews organized and export them for your research" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0 ring-4 ring-primary/10" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground font-medium">{item.title}:</strong> {item.description}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-primary/25 hover:bg-primary/10 hover:border-primary/40 transition-all"
              >
                <Link href="/review" className="flex items-center gap-2">
                  <span>Generate Review</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="absolute top-0 right-0 w-3/4 h-3/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
              background: 'radial-gradient(circle at top right, rgba(var(--primary), 0.15) 0%, rgba(var(--primary), 0.08) 25%, rgba(var(--primary), 0.02) 50%, transparent 70%)',
              filter: 'blur(8px)'
            }} />
          </motion.div>
        </div>

        {/* Supporting Features - no animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paper Search */}
          <div className="group rounded-3xl bg-gradient-to-br from-primary/8 via-primary/5 to-background border border-primary/15 p-8 relative overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500">
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

            <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
              background: 'radial-gradient(circle at top right, rgba(var(--primary), 0.12) 0%, rgba(var(--primary), 0.06) 25%, rgba(var(--primary), 0.02) 50%, transparent 70%)',
              filter: 'blur(6px)'
            }} />
          </div>

          {/* AI-Powered */}
          <div className="group rounded-3xl bg-gradient-to-br from-primary/8 via-primary/5 to-background border border-primary/15 p-8 relative overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500">
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

            <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
              background: 'radial-gradient(circle at top right, rgba(var(--primary), 0.12) 0%, rgba(var(--primary), 0.06) 25%, rgba(var(--primary), 0.02) 50%, transparent 70%)',
              filter: 'blur(6px)'
            }} />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

        <div className="relative container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From paper discovery to comprehensive understanding in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
            {[
              { step: "1", title: "Search Papers", description: "Search arXiv for papers on your research topic or upload your own PDF", icon: Search },
              { step: "2", title: "Analyze or Review", description: "Get deep insights from individual papers or generate a comprehensive literature review", icon: Sparkles },
              { step: "3", title: "Explore & Export", description: "Chat with papers, explore findings, and export your reviews for your research", icon: BookOpen },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:scale-105 transition-all duration-500 shadow-lg shadow-primary/5">
                    <item.icon className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed px-4">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
