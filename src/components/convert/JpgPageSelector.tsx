"use client";

import { useState } from "react";
import { Document } from "react-pdf";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { PageThumbnail } from "@/components/pdf-pages/PageThumbnail";
import { PagePreviewDialog } from "@/components/pdf-pages/PagePreviewDialog";

interface JpgPageSelectorProps {
  file: File;
  selectedPages: Set<number>;
  onToggleSelect: (pageNumber: number) => void;
  previewPageNumber: number | null;
  onPreview: (pageNumber: number) => void;
  onClosePreview: () => void;
  onDocumentLoaded: (pageCount: number) => void;
  disabled?: boolean;
}

/** Page picker for PDF to JPG - "which pages get rendered" (empty
 * selection = every page, zipped together). Same lazy-render pattern as
 * every other page-picker grid. */
export function JpgPageSelector({
  file,
  selectedPages,
  onToggleSelect,
  previewPageNumber,
  onPreview,
  onClosePreview,
  onDocumentLoaded,
  disabled,
}: JpgPageSelectorProps) {
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <Document
      file={file}
      loading={
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" label="Loading PDF…" />
        </div>
      }
      error={
        <div className="flex h-40 flex-col items-center justify-center gap-3 text-white/55">
          <FileWarning className="h-8 w-8 text-danger" />
          <p className="text-sm">Could not load this PDF file.</p>
        </div>
      }
      onLoadSuccess={({ numPages }) => {
        setPageCount(numPages);
        onDocumentLoaded(numPages);
      }}
      onLoadError={(error) => setLoadError(error.message)}
    >
      {!loadError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
            <PageThumbnail
              key={pageNumber}
              pageNumber={pageNumber}
              position={pageNumber}
              variant="pdf-to-jpg"
              isSelected={selectedPages.has(pageNumber)}
              isDisabled={disabled}
              onToggleSelect={() => onToggleSelect(pageNumber)}
              onPreview={() => onPreview(pageNumber)}
            />
          ))}
        </div>
      )}

      <PagePreviewDialog
        pageNumber={previewPageNumber}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClosePreview();
        }}
      />
    </Document>
  );
}
