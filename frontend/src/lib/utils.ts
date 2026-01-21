import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to title case, capitalizing the first letter of each word
 * except for common prepositions and articles.
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
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Keep prepositions/articles lowercase
      if (lowercaseWords.has(word)) {
        return word;
      }
      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
