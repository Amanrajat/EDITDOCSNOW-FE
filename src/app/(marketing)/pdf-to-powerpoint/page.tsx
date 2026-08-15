"use client";

import { Presentation as PresentationIcon } from "lucide-react";
import { ConversionToolPage } from "@/components/convert/ConversionToolPage";

export default function PdfToPowerPointPage() {
  return (
    <ConversionToolPage
      icon={<PresentationIcon className="h-7 w-7" aria-hidden />}
      title="PDF to PowerPoint"
      description="Turn your PDF into an editable slide deck - one slide per page, with real text, tables, and images."
      endpointPath="/convert/pdf-to-pptx/"
      submitLabel="Convert to PowerPoint"
      resultHeading="Your PDF is now a slide deck"
      resultDescription={(result) => {
        const scanned = Array.isArray(result.scanned_pages) ? result.scanned_pages.length : 0;
        return scanned > 0
          ? `${result.page_count} slides created (${scanned} scanned page${scanned === 1 ? "" : "s"} kept as images).`
          : `${result.page_count} slides created.`;
      }}
      resultFilename="converted.pptx"
      renderStats={(result) => (
        <div className="grid grid-cols-3 gap-3 text-center text-sm text-white/60">
          <div>
            <p className="text-lg font-semibold text-white">{String(result.page_count ?? "-")}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Slides</p>
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
