"use client";

import { useState } from "react";
import { Document } from "react-pdf";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { PageThumbnail } from "./PageThumbnail";
import { PagePreviewDialog } from "./PagePreviewDialog";

interface RemovePagesGridProps {
  file: File;
  pagesToRemove: Set<number>;
  onToggleMarked: (pageNumber: number) => void;
  previewPageNumber: number | null;
  onPreview: (pageNumber: number) => void;
  onClosePreview: () => void;
  onDocumentLoaded: (pageCount: number) => void;
  disabled?: boolean;
}

/**
 * Selection-only page grid for Remove Pages - always shows pages in their
 * natural 1..N order (no reordering here, unlike Organize PDF), letting
 * the user mark pages for deletion. Shares PageThumbnail/PagePreviewDialog
 * with OrganizePageGrid rather than duplicating the rendering/lazy-load
 * logic.
 */
export function RemovePagesGrid({
  file,
  pagesToRemove,
  onToggleMarked,
  previewPageNumber,
  onPreview,
  onClosePreview,
  onDocumentLoaded,
  disabled,
}: RemovePagesGridProps) {
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
              variant="remove"
              isSelected={pagesToRemove.has(pageNumber)}
              isDisabled={disabled}
              onToggleSelect={() => onToggleMarked(pageNumber)}
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
