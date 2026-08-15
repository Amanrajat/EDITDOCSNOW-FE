/** Related-tool slugs per tool slug — every slug here must match a real
 * ToolMeta.slug in src/config/navigation.ts. */
export const RELATED_TOOLS: Record<string, string[]> = {
  merge: ["split", "organize", "remove-pages"],
  split: ["merge", "organize", "remove-pages"],
  organize: ["merge", "remove-pages", "rotate"],
  "remove-pages": ["organize", "split", "merge"],
  rotate: ["crop", "organize", "page-numbers"],
  crop: ["rotate", "page-numbers", "organize"],
  "page-numbers": ["crop", "rotate", "organize"],
  compress: ["batch-compress", "pdf-to-jpg", "pdf-to-word"],
  "batch-compress": ["compress", "merge", "pdf-to-pdfa"],
  "pdf-to-word": ["pdf-to-excel", "pdf-to-powerpoint", "editor"],
  "pdf-to-excel": ["pdf-to-word", "pdf-to-markdown", "pdf-to-jpg"],
  "pdf-to-powerpoint": ["pdf-to-word", "pdf-to-jpg", "pdf-to-markdown"],
  "pdf-to-jpg": ["jpg-to-pdf", "compress", "pdf-to-word"],
  "pdf-to-markdown": ["pdf-to-word", "pdf-to-excel", "ocr"],
  "pdf-to-pdfa": ["compress", "batch-compress", "pdf-to-word"],
  "word-to-pdf": ["excel-to-pdf", "powerpoint-to-pdf", "pdf-to-word"],
  "excel-to-pdf": ["word-to-pdf", "powerpoint-to-pdf", "pdf-to-excel"],
  "powerpoint-to-pdf": ["word-to-pdf", "excel-to-pdf", "pdf-to-powerpoint"],
  "jpg-to-pdf": ["pdf-to-jpg", "html-to-pdf", "merge"],
  "html-to-pdf": ["jpg-to-pdf", "word-to-pdf", "merge"],
  ocr: ["editor", "pdf-to-word", "pdf-to-markdown"],
  editor: ["ocr", "pdf-to-word", "merge"],
};

export function getRelatedSlugs(slug: string): string[] {
  return RELATED_TOOLS[slug] ?? [];
}
