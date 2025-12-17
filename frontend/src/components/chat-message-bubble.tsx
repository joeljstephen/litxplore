import { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

interface ChatMessageBubbleProps {
  message: UIMessage;
  isLoading?: boolean;
}

// Helper function to extract text content from UIMessage parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return "";
  }
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}

export function ChatMessageBubble({
  message,
  isLoading,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const content = getMessageContent(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-persian-blue-50 text-foreground rounded-bl-none border border-persian-blue-100",
          isLoading && "animate-pulse"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className={cn(isUser && "text-secondary")}
          components={{
            p: ({ children }) => (
              <p
                className={cn(
                  "mb-2 last:mb-0 leading-relaxed",
                  isUser && "text-secondary"
                )}
              >
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hover:underline",
                  isUser ? "text-blue-200" : "text-persian-blue-600"
                )}
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code
                className={cn(
                  "rounded px-1 py-0.5",
                  isUser ? "bg-primary-foreground/20" : "bg-persian-blue-100/50"
                )}
              >
                {children}
              </code>
            ),
            ul: ({ children }) => (
              <ul
                className={cn(
                  "list-disc pl-4 mb-2",
                  isUser && "text-secondary"
                )}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                className={cn(
                  "list-decimal pl-4 mb-2",
                  isUser && "text-secondary"
                )}
              >
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className={cn(
                  "border-l-2 pl-2 italic",
                  isUser
                    ? "border-secondary text-secondary"
                    : "border-persian-blue-300"
                )}
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {message.role === "assistant" && message.id && (
          <div className="mt-2 text-xs text-persian-blue-400 flex items-center gap-2">
            {isLoading && (
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            )}
            <span>{message.id}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
