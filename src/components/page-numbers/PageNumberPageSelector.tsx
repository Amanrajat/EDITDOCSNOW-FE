"use client";

import { useState } from "react";
import { Document } from "react-pdf";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { PageThumbnail } from "@/components/pdf-pages/PageThumbnail";
import { PagePreviewDialog } from "@/components/pdf-pages/PagePreviewDialog";

interface PageNumberPageSelectorProps {
  file: File;
  selectedPages: Set<number>;
  onToggleSelect: (pageNumber: number) => void;
  previewPageNumber: number | null;
  onPreview: (pageNumber: number) => void;
  onClosePreview: () => void;
  onDocumentLoaded: (pageCount: number) => void;
  disabled?: boolean;
}

/**
 * Page picker for Page Numbers - "which pages get numbered" (empty
 * selection = every page). Numbering itself is always sequential in page
 * order starting at start_number, regardless of which pages are chosen -
 * see the backend's PageNumberService docstring. Reuses the same
 * lazy-render PageThumbnail/PagePreviewDialog pattern as every other
 * page-picker grid (Organize/Remove Pages/Rotate/Crop).
 */
export function PageNumberPageSelector({
  file,
  selectedPages,
  onToggleSelect,
  previewPageNumber,
  onPreview,
  onClosePreview,
  onDocumentLoaded,
  disabled,
}: PageNumberPageSelectorProps) {
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <Document
      file={file}
      loading={
        <div className="flex h-32 items-center justify-center">
          <Spinner size="lg" label="Loading PDF…" />
        </div>
      }
      error={
        <div className="flex h-32 flex-col items-center justify-center gap-3 text-white/55">
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
      {/* Fixed 2-column grid, not viewport-responsive breakpoints - this
          renders inside a narrow fixed-width sidebar column, not the page
          body (see CropPageSelector for the same reasoning). */}
      {!loadError && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
            <PageThumbnail
              key={pageNumber}
              pageNumber={pageNumber}
              position={pageNumber}
              variant="page-numbers"
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
