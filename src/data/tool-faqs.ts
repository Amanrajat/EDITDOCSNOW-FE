export interface Faq {
  question: string;
  answer: string;
}

/** General, platform-wide FAQs shown on the homepage — about the 22-tool
 * platform as a whole, not any single tool. */
export const GENERAL_FAQS: Faq[] = [
  { question: "What file types are supported?", answer: "Most tools accept PDF files; a few (like JPG to PDF, Word/Excel/PowerPoint to PDF, and HTML to PDF) start from images, Office documents, or a webpage/HTML instead." },
  { question: "Do I need to create an account?", answer: "No. Upload a file and start using any tool right away — no sign-up required." },
  { question: "Is my original file modified?", answer: "No. Every tool generates a new output file; your original upload is never changed in place." },
  { question: "How long are my files kept?", answer: "Files are processed by the EditDocsNow backend and kept only as long as needed to serve your downloads." },
  { question: "Can I use more than one tool on the same file?", answer: "Yes — download the result from one tool, then upload it to another (for example, compress a PDF, then convert it to Word)." },
];

/** FAQ copy per tool slug, grounded in each tool's actual implementation —
 * see the hooks in src/hooks/ for the real capabilities behind each answer. */
export const TOOL_FAQS: Record<string, Faq[]> = {
  merge: [
    { question: "How many PDFs can I merge?", answer: "You can add as many PDF files as you like to the merge queue — there's no fixed limit on file count." },
    { question: "Can I reorder the files before merging?", answer: "Yes. Drag files in the list, or use the arrow buttons, to set the exact order they'll appear in the combined PDF." },
    { question: "Does merging reduce quality?", answer: "No. Pages are combined as-is — merging doesn't recompress or alter page content." },
    { question: "Is the original file modified?", answer: "No. Merging creates a brand-new PDF; your original files are left untouched." },
  ],
  split: [
    { question: "What split modes are available?", answer: "Every page as its own file, custom page ranges (e.g. \"1-5,6-10\"), every N pages, or extracting specific pages into one file." },
    { question: "Will I get one file or several?", answer: "If splitting produces more than one output file, they're bundled into a single ZIP download." },
    { question: "Can I choose the order of extracted pages?", answer: "Yes — in Extract mode, pages are combined in the order you list them (e.g. \"3, 1, 5\")." },
    { question: "Is the original file modified?", answer: "No. Splitting reads your original PDF and generates new files; nothing is changed in place." },
  ],
  organize: [
    { question: "Does organizing remove any pages?", answer: "No. Organize only changes page order — every page in the original is kept in the output." },
    { question: "How do I reorder pages?", answer: "Drag pages in the grid into the order you want, then click Organize PDF to generate the reordered file." },
    { question: "What does selecting a page do?", answer: "Selection is for preview only in Organize — it doesn't affect which pages are kept or removed." },
    { question: "Is the original file modified?", answer: "No. A new PDF is generated in your chosen order; the original is untouched." },
  ],
  "remove-pages": [
    { question: "Can I remove multiple pages at once?", answer: "Yes — mark as many pages as you like for removal before confirming." },
    { question: "Can I remove every page?", answer: "No. At least one page must remain in the output, so removing every page is blocked." },
    { question: "Is there a confirmation step?", answer: "Yes — you'll see a confirmation dialog listing the exact pages that will be deleted before it happens." },
    { question: "Is the original file modified?", answer: "No. Removal creates a new copy of the PDF without the marked pages; your original file is not changed." },
  ],
  rotate: [
    { question: "Can I rotate just one page?", answer: "Yes — select individual pages in the grid, or rotate a page directly, to target only those pages." },
    { question: "What if I don't select any pages?", answer: "With nothing selected, the 90°/180° rotation buttons apply to every page in the document." },
    { question: "What rotation angles are supported?", answer: "Rotate left 90°, rotate right 90°, or rotate 180° — applied per page or in bulk." },
    { question: "Is the original file modified?", answer: "No. A new PDF is generated with the rotations applied; your original file is left as-is." },
  ],
  crop: [
    { question: "How do I set the crop area?", answer: "Drag the crop rectangle directly on the page preview, or use the 5%/10%/20% margin presets." },
    { question: "Can I crop only some pages?", answer: "Yes — select specific pages to crop, or leave the selection empty to apply the same crop to every page." },
    { question: "Can I preview the crop before applying it?", answer: "Yes — the crop rectangle is shown live on a reference page as you adjust it." },
    { question: "Is the original file modified?", answer: "No. Cropping generates a new PDF; your original file is not changed." },
  ],
  "page-numbers": [
    { question: "Where can page numbers be placed?", answer: "Any of six positions: top or bottom, combined with left, center, or right." },
    { question: "Can I customize the style?", answer: "Yes — set the starting number, font size, font color, and an optional prefix or suffix (e.g. \"Page 1 of 10\")." },
    { question: "Can I number only some pages?", answer: "Yes — select specific pages, or leave the selection empty to number every page." },
    { question: "Is the original file modified?", answer: "No. A new PDF is generated with the page numbers stamped on; the original is untouched." },
  ],
  compress: [
    { question: "What does PDF compression do?", answer: "It reduces file size, primarily by recompressing embedded images, while keeping the document readable." },
    { question: "Will compression reduce PDF quality?", answer: "Higher compression levels trade off some image quality for a smaller file. High Quality keeps images closest to original; Maximum Compression allows noticeable quality loss for the smallest size." },
    { question: "Which compression level should I choose?", answer: "Recommended is a balanced default for most PDFs. Use High Quality for print/archival, or High/Maximum Compression when file size matters most." },
    { question: "Is my original PDF modified?", answer: "No. Compression produces a new file; your original upload is not changed." },
    { question: "Is the compressed PDF downloadable immediately?", answer: "Yes — once compression finishes, you can download it, open it in a new tab, or copy a shareable link." },
  ],
  "batch-compress": [
    { question: "How many files can I compress at once?", answer: "You can add multiple PDFs to a single batch — each is compressed independently and tracked with its own status." },
    { question: "What happens if one file fails?", answer: "Other files in the batch keep processing normally. Failed files are marked, and you can retry just those failed files." },
    { question: "How do I download the results?", answer: "Once the batch finishes, every successfully compressed file is bundled into one ZIP download." },
    { question: "Is processing done in the background?", answer: "Yes — batch compression runs asynchronously; you can watch each file's status update as it completes." },
  ],
  "pdf-to-word": [
    { question: "What gets preserved in the conversion?", answer: "Text, tables, and images are converted into an editable Word (.docx) document." },
    { question: "What happens to scanned pages?", answer: "Pages that are scanned images rather than real text are kept as images in the output rather than being guessed at as text." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces a new .docx file; your uploaded PDF is not changed." },
  ],
  "pdf-to-excel": [
    { question: "What does this tool extract?", answer: "Tables detected in your PDF are converted into spreadsheet rows and columns in an .xlsx file." },
    { question: "Does it work on any PDF?", answer: "It works best on PDFs that contain actual tables — results depend on how clearly the table structure is defined in the source file." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces a new spreadsheet; your uploaded PDF is left unchanged." },
  ],
  "pdf-to-powerpoint": [
    { question: "How does PDF to PowerPoint work?", answer: "Each page of your PDF becomes one slide in the resulting .pptx presentation." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces a new presentation file; your uploaded PDF is not changed." },
  ],
  "pdf-to-jpg": [
    { question: "Can I convert only some pages?", answer: "Yes — select specific pages, or leave the selection empty to convert every page." },
    { question: "Can I control image quality?", answer: "Yes — set the resolution (DPI, 72–600) and JPEG quality (1–100) before converting." },
    { question: "What do I get if I convert multiple pages?", answer: "A ZIP file containing one JPG per converted page. A single-page conversion downloads as one JPG." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces new image files; your uploaded PDF is not changed." },
  ],
  "pdf-to-markdown": [
    { question: "What does PDF to Markdown extract?", answer: "Headings, paragraphs, and tables are converted into plain-text Markdown formatting." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces a new .md file; your uploaded PDF is left unchanged." },
  ],
  "pdf-to-pdfa": [
    { question: "What is PDF/A?", answer: "PDF/A is an ISO standard for long-term document archiving, which restricts certain PDF features to guarantee the file looks the same far into the future." },
    { question: "Which PDF/A levels are supported?", answer: "PDF/A-1b, PDF/A-2b, and PDF/A-3b — \"b\" (basic) conformance guarantees visual reproducibility, with higher numbers supporting newer features like transparency, JPEG2000, and attachments." },
    { question: "What tool performs the conversion?", answer: "Conversion runs through Ghostscript's dedicated PDF/A device." },
    { question: "Is the original PDF modified?", answer: "No. Conversion produces a new PDF/A-conformant file; your uploaded PDF is not changed." },
  ],
  "word-to-pdf": [
    { question: "What file types are accepted?", answer: "Word documents (.docx)." },
    { question: "Is formatting preserved?", answer: "Yes — layout and formatting from your Word document carry over to the generated PDF." },
    { question: "Is the original file modified?", answer: "No. Conversion produces a new PDF; your uploaded Word document is left unchanged." },
  ],
  "excel-to-pdf": [
    { question: "What file types are accepted?", answer: "Excel spreadsheets (.xlsx)." },
    { question: "Is formatting preserved?", answer: "Yes — layout and formatting from your spreadsheet carry over to the generated PDF." },
    { question: "Is the original file modified?", answer: "No. Conversion produces a new PDF; your uploaded spreadsheet is left unchanged." },
  ],
  "powerpoint-to-pdf": [
    { question: "What file types are accepted?", answer: "PowerPoint presentations (.pptx)." },
    { question: "Is formatting preserved?", answer: "Yes — layout and formatting from your slide deck carry over to the generated PDF." },
    { question: "Is the original file modified?", answer: "No. Conversion produces a new PDF; your uploaded presentation is left unchanged." },
  ],
  "jpg-to-pdf": [
    { question: "What image formats are supported?", answer: "JPG and PNG images." },
    { question: "Can I reorder the images?", answer: "Yes — drag images, or use the arrow buttons, to set the page order before creating the PDF." },
    { question: "What's the difference between Fit and Fill?", answer: "Fit shows the whole image within the page (may leave margins); Fill crops the image to cover the entire page." },
    { question: "Can I control output quality?", answer: "Yes — set the page size, orientation, margin, and (in Fill mode) JPEG quality." },
  ],
  "html-to-pdf": [
    { question: "Can I convert a live webpage?", answer: "Yes — enter a public URL and it will be rendered to PDF." },
    { question: "Can I convert raw HTML instead?", answer: "Yes — switch to the Raw HTML input and paste your markup directly." },
    { question: "Are internal or private URLs allowed?", answer: "No. Only public URLs are accepted; internal/private network addresses are blocked for safety." },
    { question: "Can I control the page layout?", answer: "Yes — choose page size (A4 or Letter) and orientation (portrait or landscape)." },
  ],
  ocr: [
    { question: "What is OCR?", answer: "Optical Character Recognition detects text in scanned or image-only pages and adds it as a real, selectable text layer." },
    { question: "Can OCR make scanned PDFs searchable?", answer: "Yes — that's exactly what it's for. Pages that were previously just images become searchable and selectable." },
    { question: "Which languages are supported?", answer: "English, French, German, Spanish, and Hindi." },
    { question: "Can OCR process multi-page documents?", answer: "Yes — every scanned page in the document is processed; pages that already had real text are left as they were." },
    { question: "Does OCR preserve the original page image?", answer: "Yes — the page image itself isn't altered; a searchable text layer is added on top of it." },
    { question: "How long does OCR take?", answer: "It runs as a background job and can take a little while for multi-page scans — you'll see live status while it processes." },
  ],
  editor: [
    { question: "What can I edit with the Advanced PDF Editor?", answer: "Text blocks that were automatically detected on the page, plus images, shapes, and freehand annotations you add yourself." },
    { question: "Can I edit existing text?", answer: "Yes — click any detected text block and rewrite it in place; font, size, color, and position stay where they were." },
    { question: "Can I add images and shapes?", answer: "Yes — the tool palette includes image, rectangle, ellipse, line, and arrow tools." },
    { question: "Can I draw freehand annotations?", answer: "Yes — pen and highlighter tools are available for freehand marks and highlights." },
    { question: "Can I undo changes?", answer: "Yes — undo/redo is supported for edits made in the session." },
    { question: "Is the original PDF modified?", answer: "No. Saving regenerates the PDF from the original file using your current edits; the source file itself isn't touched." },
  ],
};

export function getToolFaqs(slug: string): Faq[] {
  return TOOL_FAQS[slug] ?? [];
}
