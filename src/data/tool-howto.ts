export interface HowToStep {
  title: string;
  description: string;
}

/** Step-by-step "how to use" copy per tool slug, describing the actual
 * implemented workflow on each tool's page — not aspirational functionality. */
export const TOOL_HOWTO: Record<string, HowToStep[]> = {
  merge: [
    { title: "Upload your PDFs", description: "Add two or more PDF files to the merge queue." },
    { title: "Arrange the order", description: "Drag files, or use the arrow buttons, to set the order they'll be combined in." },
    { title: "Merge", description: "Click Merge PDFs to combine every file into one document." },
    { title: "Download", description: "Download the merged PDF, open it in a new tab, or copy a link to it." },
  ],
  split: [
    { title: "Upload your PDF", description: "Choose the PDF you want to split." },
    { title: "Choose a split mode", description: "Split every page, define custom ranges, split every N pages, or extract specific pages." },
    { title: "Split", description: "Click Split PDF to generate the output files (zipped together when there's more than one)." },
    { title: "Download", description: "Download the result, open it, or copy a link to it." },
  ],
  organize: [
    { title: "Upload your PDF", description: "The page grid loads once your file finishes rendering." },
    { title: "Drag to reorder", description: "Rearrange pages into the order you want. Every page stays — nothing is removed." },
    { title: "Organize", description: "Click Organize PDF to generate a new PDF in your chosen order." },
    { title: "Download", description: "Download the reorganized PDF, open it, or copy a link to it." },
  ],
  "remove-pages": [
    { title: "Upload your PDF", description: "The page grid loads once your file finishes rendering." },
    { title: "Mark pages for removal", description: "Click each page you want to delete (you must leave at least one page)." },
    { title: "Confirm removal", description: "Click Remove pages and confirm — your original file is never modified." },
    { title: "Download", description: "Download the new PDF without the removed pages." },
  ],
  rotate: [
    { title: "Upload your PDF", description: "The page grid loads once your file finishes rendering." },
    { title: "Select pages (optional)", description: "Select specific pages to target, or leave nothing selected to rotate every page." },
    { title: "Rotate", description: "Use the 90° left/right or 180° buttons, or rotate individual pages from the grid." },
    { title: "Apply and download", description: "Click Apply rotation(s) and download the corrected PDF." },
  ],
  crop: [
    { title: "Upload your PDF", description: "A live preview of your reference page loads for cropping." },
    { title: "Drag the crop rectangle", description: "Adjust it directly on the page, or use the 5%/10%/20% margin presets." },
    { title: "Choose pages", description: "Select specific pages to crop, or leave nothing selected to crop every page." },
    { title: "Apply and download", description: "Click Apply crop and download the cropped PDF." },
  ],
  "page-numbers": [
    { title: "Upload your PDF", description: "A live preview of page 1 loads to show number placement." },
    { title: "Style the numbers", description: "Choose position, start number, font size, color, prefix, and suffix." },
    { title: "Choose pages", description: "Select specific pages to number, or leave nothing selected to number every page." },
    { title: "Add and download", description: "Click Add page numbers and download the stamped PDF." },
  ],
  compress: [
    { title: "Upload your PDF", description: "Choose the PDF you want to shrink." },
    { title: "Pick a compression level", description: "High Quality, Recommended, High Compression, or Maximum Compression." },
    { title: "Compress", description: "Click Compress PDF to process the file." },
    { title: "Download", description: "See the before/after size and reduction percentage, then download the result." },
  ],
  "batch-compress": [
    { title: "Upload multiple PDFs", description: "Add as many files as you want to compress in one batch." },
    { title: "Pick a compression level", description: "The same level is applied to every file in the batch." },
    { title: "Compress in the background", description: "Each file's progress is tracked individually while it processes." },
    { title: "Download the ZIP", description: "Download every successful file as one ZIP; retry only the files that failed." },
  ],
  "pdf-to-word": [
    { title: "Upload your PDF", description: "Choose the PDF you want to convert." },
    { title: "Convert", description: "Click Convert to Word — text, tables, and images are preserved." },
    { title: "Download", description: "Download the .docx file, open it, or copy a link to it." },
  ],
  "pdf-to-excel": [
    { title: "Upload your PDF", description: "Choose a PDF that contains tables." },
    { title: "Convert", description: "Click Convert — tables are extracted into spreadsheet rows and columns." },
    { title: "Download", description: "Download the .xlsx file, open it, or copy a link to it." },
  ],
  "pdf-to-powerpoint": [
    { title: "Upload your PDF", description: "Choose the PDF you want to turn into slides." },
    { title: "Convert", description: "Click Convert — each PDF page becomes a slide." },
    { title: "Download", description: "Download the .pptx file, open it, or copy a link to it." },
  ],
  "pdf-to-jpg": [
    { title: "Upload your PDF", description: "The page grid loads once your file finishes rendering." },
    { title: "Choose pages and quality", description: "Select specific pages (or convert all), and set resolution (DPI) and JPEG quality." },
    { title: "Convert", description: "Click Convert to JPG." },
    { title: "Download", description: "Download a single JPG, or a ZIP if multiple pages were converted." },
  ],
  "pdf-to-markdown": [
    { title: "Upload your PDF", description: "Choose the PDF you want to convert." },
    { title: "Convert", description: "Click Convert — headings, paragraphs, and tables are turned into Markdown." },
    { title: "Download", description: "Download the .md file, open it, or copy a link to it." },
  ],
  "pdf-to-pdfa": [
    { title: "Upload your PDF", description: "Choose the PDF you want to archive." },
    { title: "Choose a PDF/A standard", description: "PDF/A-1b, PDF/A-2b, or PDF/A-3b — higher numbers support newer PDF features." },
    { title: "Convert", description: "Click Convert to PDF/A — conversion runs through Ghostscript's PDF/A device." },
    { title: "Download", description: "Download the archival PDF/A file." },
  ],
  "word-to-pdf": [
    { title: "Upload your Word document", description: "Choose the .docx file you want to convert." },
    { title: "Convert", description: "Click Convert — layout and formatting are preserved." },
    { title: "Download", description: "Download the resulting PDF, open it, or copy a link to it." },
  ],
  "excel-to-pdf": [
    { title: "Upload your spreadsheet", description: "Choose the .xlsx file you want to convert." },
    { title: "Convert", description: "Click Convert — layout and formatting are preserved." },
    { title: "Download", description: "Download the resulting PDF, open it, or copy a link to it." },
  ],
  "powerpoint-to-pdf": [
    { title: "Upload your slide deck", description: "Choose the .pptx file you want to convert." },
    { title: "Convert", description: "Click Convert — layout and formatting are preserved." },
    { title: "Download", description: "Download the resulting PDF, open it, or copy a link to it." },
  ],
  "jpg-to-pdf": [
    { title: "Upload your images", description: "Add JPG or PNG images and drag to set their order." },
    { title: "Choose page settings", description: "Pick page size, orientation, fit mode (fit or fill), margin, and JPEG quality." },
    { title: "Create the PDF", description: "Click Create PDF — one page per image, in the order you set." },
    { title: "Download", description: "Download the resulting PDF, open it, or copy a link to it." },
  ],
  "html-to-pdf": [
    { title: "Choose your input", description: "Enter a public webpage URL, or paste raw HTML directly." },
    { title: "Set page options", description: "Choose page size (A4 or Letter) and orientation (portrait or landscape)." },
    { title: "Convert", description: "Click Convert to PDF." },
    { title: "Download", description: "Download the resulting PDF, open it, or copy a link to it." },
  ],
  ocr: [
    { title: "Upload a scanned PDF", description: "Choose the PDF that has scanned or image-only pages." },
    { title: "Choose a language", description: "Select the document's language: English, French, German, Spanish, or Hindi." },
    { title: "Run OCR", description: "Processing happens in the background — you'll see live status while it runs." },
    { title: "Download", description: "Download the same PDF with a searchable, selectable text layer added." },
  ],
  editor: [
    { title: "Upload a PDF", description: "Start from the upload page — the editor opens once your document is ready." },
    { title: "Extract editable text", description: "The editor automatically detects every text block on the page." },
    { title: "Edit visually", description: "Click any text block to edit it in place, or use the tool palette to add images, shapes, and freehand annotations." },
    { title: "Save and download", description: "Save your changes and download the regenerated PDF." },
  ],
};

export function getHowToSteps(slug: string): HowToStep[] {
  return TOOL_HOWTO[slug] ?? [];
}
