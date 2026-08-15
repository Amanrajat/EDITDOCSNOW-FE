"use client";

import { FileText } from "lucide-react";
import { ConversionToolPage } from "@/components/convert/ConversionToolPage";

export function PdfToWordClient() {
  return (
    <ConversionToolPage
      icon={<FileText className="h-7 w-7" aria-hidden />}
      title="PDF to Word"
      description="Convert your PDF into an editable Word document - text, tables, and images preserved."
      endpointPath="/convert/pdf-to-word/"
      submitLabel="Convert to Word"
      resultHeading="Your PDF is now a Word document"
      resultDescription={(result) => {
        const scanned = Array.isArray(result.scanned_pages) ? result.scanned_pages.length : 0;
        return scanned > 0
          ? `${result.page_count} pages converted (${scanned} scanned page${scanned === 1 ? "" : "s"} kept as images).`
          : `${result.page_count} pages converted.`;
      }}
      resultFilename="converted.docx"
      renderStats={(result) => (
        <div className="grid grid-cols-3 gap-3 text-center text-sm text-white/60">
          <div>
            <p className="text-lg font-semibold text-white">{String(result.page_count ?? "-")}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Pages</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{String(result.table_count ?? 0)}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Tables</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{String(result.image_count ?? 0)}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Images</p>
          </div>
        </div>
      )}
    />
  );
}
