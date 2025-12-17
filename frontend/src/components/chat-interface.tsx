"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Paper } from "@/lib/api/generated";
import { useEffect, useRef, useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Helper function to extract text content from UIMessage parts
function getMessageContent(message: UIMessage | { content: string }): string {
  // Handle the welcome message which uses the old format
  if ("content" in message && typeof message.content === "string") {
    return message.content;
  }
  // Handle UIMessage with parts
  const uiMessage = message as UIMessage;
  if (!uiMessage.parts || uiMessage.parts.length === 0) {
    return "";
  }
  return uiMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}

interface ChatInterfaceProps {
  paper: Paper;
  isEmbedded?: boolean;
  onClose?: () => void;
}

export function ChatInterface({
  paper,
  isEmbedded = false,
  onClose,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputRows, setInputRows] = useState(1);
  const [input, setInput] = useState("");

  // Research paper expert system prompt
  const researchExpertPrompt = `
    You are an expert in academic research papers with deep knowledge of scientific methodologies and academic literature.
    
    When analyzing "${paper.title}":
    - Provide thorough explanations of research methods, findings, and implications
    - Clarify complex technical concepts while maintaining scientific accuracy
    - Reference specific sections, figures, or tables when relevant
    - Contextualize the research within its broader academic field
    - When uncertain, acknowledge limitations rather than speculating
    - Structure responses with clear organization using headings and bullet points
    
    Aim to help users gain a comprehensive, graduate-level understanding of this research paper.
  `;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        paperId: paper.id,
        model: "gemini-2.0-flash",
        systemPrompt: researchExpertPrompt,
      },
    }),
    onFinish: () => {
      scrollToBottom();
      inputRef.current?.focus();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Adjust textarea height based on content
  useEffect(() => {
    if (input.length === 0) {
      setInputRows(1);
    } else {
      const rowCount = input.split("\n").length;
      setInputRows(Math.min(Math.max(rowCount, 1), 5)); // Limit to 5 rows max
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create an initial greeting message if no messages exist
  const displayMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: "welcome",
            role: "assistant",
            content: `👋 Hello! I'm your research paper expert assistant. I have analyzed "${paper.title}" and can provide detailed information about the paper.

What would you like to know about this paper?`,
          },
        ];

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-background",
        isEmbedded ? "" : "border rounded-lg shadow-lg"
      )}
    >
      {/* Header - Fixed */}
      <div className="border-b p-4 flex-shrink-0 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="max-w-[85%]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>LitXplore Assistant</span>
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {paper.title}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/30">
        <AnimatePresence initial={false}>
          {displayMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-3 max-w-[85%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                )}
              >
                <div className="mt-1 hidden sm:block">
                  {message.role === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  )}
                </div>
                <div className="overflow-hidden break-words">
                  <div
                    className={cn(
                      "prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0",
                      message.role === "user"
                        ? "prose-invert"
                        : "prose-slate dark:prose-invert"
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-semibold mt-4 mb-2">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-sm font-semibold mt-3 mb-1">
                            {children}
                          </h4>
                        ),
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: {
                          inline?: boolean;
                          className?: string;
                          children: React.ReactNode;
                          [key: string]: any;
                        }) => (
                          <code
                            className={cn(
                              "rounded text-sm font-mono",
                              inline
                                ? "bg-slate-200 dark:bg-slate-700 px-1 py-0.5"
                                : "bg-slate-100 dark:bg-slate-800 block p-2 overflow-x-auto",
                              message.role === "user"
                                ? "text-white bg-blue-700 dark:bg-blue-700"
                                : "",
                              className
                            )}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {getMessageContent(message)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Fixed */}
      <div className="border-t p-3 bg-white dark:bg-slate-950">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Submit on Enter, but allow Shift+Enter for new lines
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    // Create a synthetic form submit event
                    const form = e.currentTarget.form;
                    if (form) form.requestSubmit();
                  }
                }
              }}
              rows={inputRows}
              placeholder="Ask about the paper... (Enter to send, Shift+Enter for new line)"
              className="resize-none pr-12 min-h-[44px] py-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
