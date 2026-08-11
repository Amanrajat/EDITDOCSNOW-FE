export interface HighlightSegment {
  text: string;
  match: boolean;
}

/** Split text into segments so a search query can be rendered as <mark>. */
export function highlightMatches(text: string, query: string): HighlightSegment[] {
  if (!query.trim()) return [{ text, match: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}

export function matchesSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}
