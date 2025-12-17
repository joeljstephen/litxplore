import { useCallback, useMemo } from "react";
import { UIMessage } from "ai";

const MAX_HISTORY_MESSAGES = 20;
const MAX_CONTEXT_WINDOW = 8000; // tokens approximate

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

export function useChatHistory(messages: UIMessage[]) {
  /**
   * Truncate chat history to keep recent messages within context window.
   * Keeps the first message (system context) and recent messages.
   */
  const truncatedHistory = useMemo(() => {
    if (messages.length <= MAX_HISTORY_MESSAGES) {
      return messages;
    }

    // Keep first message (usually system context) and recent messages
    const firstMessage = messages[0];
    const recentMessages = messages.slice(-(MAX_HISTORY_MESSAGES - 1));

    return [firstMessage, ...recentMessages];
  }, [messages]);

  /**
   * Get context window for API calls.
   * Truncates history to fit within token limit.
   */
  const getContextWindow = useCallback(() => {
    let totalLength = 0;
    const contextMessages: UIMessage[] = [];

    // Always include first message
    if (truncatedHistory.length > 0) {
      contextMessages.push(truncatedHistory[0]);
      totalLength += getMessageContent(truncatedHistory[0]).length;
    }

    // Add recent messages until we hit the limit
    for (let i = truncatedHistory.length - 1; i >= 1; i--) {
      const msg = truncatedHistory[i];
      const msgLength = getMessageContent(msg).length;

      if (totalLength + msgLength > MAX_CONTEXT_WINDOW) {
        break;
      }

      contextMessages.unshift(msg);
      totalLength += msgLength;
    }

    return contextMessages;
  }, [truncatedHistory]);

  return {
    truncatedHistory,
    getContextWindow,
    shouldTruncate: messages.length > MAX_HISTORY_MESSAGES,
  };
}
