import type { ComponentType } from "react";
import {
  Combine,
  Copy,
  Crop,
  Edit3,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FileType2,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Presentation,
  RotateCw,
  ScanText,
  ScissorsLineDashed,
  ShieldCheck,
  Sparkles,
  Split,
} from "lucide-react";

export interface ToolMeta {
  slug: string;
  href: string;
  title: string;
  /** Short one-line description used in dropdowns, cards, and the tools directory. */
  description: string;
  icon: ComponentType<{ className?: string }>;
}

/** "Organize & manipulate pages" — the PDF Tools dropdown. */
export const ORGANIZE_TOOLS: ToolMeta[] = [
  { slug: "merge", href: "/merge", title: "Merge PDF", description: "Combine multiple PDF files into one document.", icon: Combine },
  { slug: "split", href: "/split", title: "Split PDF", description: "Extract selected pages or split a PDF into multiple files.", icon: Split },
  { slug: "organize", href: "/organize", title: "Organize PDF", description: "Reorder, rearrange, and organize your PDF's pages.", icon: Layers },
  { slug: "remove-pages", href: "/remove-pages", title: "Remove Pages", description: "Delete unwanted pages from a PDF.", icon: ScissorsLineDashed },
  { slug: "rotate", href: "/rotate", title: "Rotate PDF", description: "Rotate individual pages or an entire PDF.", icon: RotateCw },
  { slug: "crop", href: "/crop", title: "Crop PDF", description: "Trim margins or crop pages to a custom area.", icon: Crop },
  { slug: "page-numbers", href: "/page-numbers", title: "Page Numbers", description: "Stamp page numbers onto your PDF.", icon: Hash },
];

/** "PDF → Other Formats" column of the Convert PDF mega-menu. */
export const CONVERT_FROM_PDF: ToolMeta[] = [
  { slug: "pdf-to-word", href: "/pdf-to-word", title: "PDF to Word", description: "Convert a PDF into an editable Word document.", icon: FileText },
  { slug: "pdf-to-excel", href: "/pdf-to-excel", title: "PDF to Excel", description: "Extract tables from a PDF into a spreadsheet.", icon: FileSpreadsheet },
  { slug: "pdf-to-powerpoint", href: "/pdf-to-powerpoint", title: "PDF to PowerPoint", description: "Turn PDF pages into an editable slide deck.", icon: Presentation },
  { slug: "pdf-to-jpg", href: "/pdf-to-jpg", title: "PDF to JPG", description: "Export PDF pages as JPG images.", icon: ImageIcon },
  { slug: "pdf-to-markdown", href: "/pdf-to-markdown", title: "PDF to Markdown", description: "Convert a PDF's text and tables into Markdown.", icon: FileCode2 },
  { slug: "pdf-to-pdfa", href: "/pdf-to-pdfa", title: "PDF to PDF/A", description: "Convert a PDF into the PDF/A archival format.", icon: ShieldCheck },
];

/** "Other Formats → PDF" column of the Convert PDF mega-menu. */
export const CONVERT_TO_PDF: ToolMeta[] = [
  { slug: "word-to-pdf", href: "/word-to-pdf", title: "Word to PDF", description: "Convert Word documents into PDF.", icon: FileType2 },
  { slug: "excel-to-pdf", href: "/excel-to-pdf", title: "Excel to PDF", description: "Convert spreadsheets into PDF.", icon: FileSpreadsheet },
  { slug: "powerpoint-to-pdf", href: "/powerpoint-to-pdf", title: "PowerPoint to PDF", description: "Convert slide decks into PDF.", icon: Presentation },
  { slug: "jpg-to-pdf", href: "/jpg-to-pdf", title: "JPG to PDF", description: "Combine JPG or PNG images into a PDF.", icon: ImageIcon },
  { slug: "html-to-pdf", href: "/html-to-pdf", title: "HTML to PDF", description: "Convert a web page or raw HTML into PDF.", icon: FileCode2 },
];

export const COMPRESS_TOOLS: ToolMeta[] = [
  { slug: "compress", href: "/compress", title: "Compress PDF", description: "Reduce file size while maintaining quality.", icon: FileArchive },
  { slug: "batch-compress", href: "/batch-compress", title: "Batch Compress", description: "Compress many PDFs at once in the background.", icon: Copy },
];

/** The visual/annotation editor only exists once a document is uploaded —
 * there are no separate routes for "Add Text"/"Images"/"Shapes", so this is
 * a single rich item rather than several fake links. */
export const EDIT_TOOLS: ToolMeta[] = [
  {
    slug: "editor",
    href: "/upload",
    title: "Advanced PDF Editor",
    description: "Edit text, add images, shapes, and freehand annotations directly on the page.",
    icon: Edit3,
  },
];

export const OCR_TOOL: ToolMeta = {
  slug: "ocr",
  href: "/ocr",
  title: "OCR",
  description: "Turn scanned PDFs into searchable, selectable documents.",
  icon: ScanText,
};

export interface ResourceLink {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const RESOURCE_LINKS: ResourceLink[] = [
  { href: "/how-it-works", title: "How It Works", description: "See the upload-to-download flow for every tool.", icon: Sparkles },
  { href: "/pdf-guides", title: "PDF Guides", description: "Step-by-step instructions for each PDF tool.", icon: FileText },
  { href: "/faq", title: "FAQ", description: "Answers to common questions about EditDocsNow.", icon: HelpCircle },
];

/** All tools, flattened — used by the /tools directory and homepage showcase. */
export const ALL_TOOLS: ToolMeta[] = [
  ...ORGANIZE_TOOLS,
  ...COMPRESS_TOOLS,
  ...CONVERT_FROM_PDF,
  ...CONVERT_TO_PDF,
  ...EDIT_TOOLS,
  OCR_TOOL,
];

export interface ToolCategoryDef {
  key: string;
  label: string;
  tools: ToolMeta[];
}

/** Grouping used by the /tools directory page. */
export const TOOL_CATEGORIES: ToolCategoryDef[] = [
  { key: "organize", label: "PDF Organization", tools: ORGANIZE_TOOLS },
  { key: "optimize", label: "PDF Optimization", tools: COMPRESS_TOOLS },
  { key: "convert-from", label: "PDF Conversion", tools: CONVERT_FROM_PDF },
  { key: "convert-to", label: "Create PDF", tools: CONVERT_TO_PDF },
  { key: "edit", label: "PDF Editing", tools: EDIT_TOOLS },
  { key: "ocr", label: "OCR", tools: [OCR_TOOL] },
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return ALL_TOOLS.find((tool) => tool.slug === slug);
}

export function getToolsBySlugs(slugs: string[]): ToolMeta[] {
  return slugs.map(getToolBySlug).filter((tool): tool is ToolMeta => tool != null);
}
