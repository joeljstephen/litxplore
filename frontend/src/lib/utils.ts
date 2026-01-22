import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to title case, capitalizing the first letter of each word
 * except for common prepositions and articles.
 * Preserves the rest of each word exactly as received.
 */
export function titleCase(str: string): string {
  if (!str) return str;

  // Words to always keep lowercase (unless they're the first word)
  const lowercaseWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet',
    'at', 'by', 'in', 'of', 'on', 'to', 'up', 'from', 'with', 'about',
    'into', 'over', 'after'
  ]);

  return str
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      // Always capitalize first word (unless it's an article/preposition that should remain lowercase)
      if (index === 0) {
        if (lowercaseWords.has(lowerWord)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Keep prepositions/articles lowercase
      if (lowercaseWords.has(lowerWord)) {
        return lowerWord;
      }

      // Capitalize first letter, keep rest as-is
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
