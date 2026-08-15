"use client";

import { useState } from "react";
import { Document } from "react-pdf";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { PageThumbnail } from "@/components/pdf-pages/PageThumbnail";
import { PagePreviewDialog } from "@/components/pdf-pages/PagePreviewDialog";

interface RotatePageGridProps {
  file: File;
  /** Pending rotation per page, in degrees (0/90/180/270), keyed by
   * 1-based page number. Pages with no entry are treated as 0. */
  rotations: Record<number, number>;
  selectedPages: Set<number>;
  onToggleSelect: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number, delta: number) => void;
  previewPageNumber: number | null;
  onPreview: (pageNumber: number) => void;
  onClosePreview: () => void;
  onDocumentLoaded: (pageCount: number) => void;
  disabled?: boolean;
}

/**
 * Page grid for Rotate PDF - always natural 1..N order (no reordering),
 * showing each page's pending rotation as a live CSS preview and letting
 * the user select pages and/or nudge individual pages left/right.
 * Reuses PageThumbnail/PagePreviewDialog rather than duplicating the
 * lazy-render/Document-loading logic already proven by Organize/Remove Pages.
 */
export function RotatePageGrid({
  file,
  rotations,
  selectedPages,
  onToggleSelect,
  onRotatePage,
  previewPageNumber,
  onPreview,
  onClosePreview,
  onDocumentLoaded,
  disabled,
}: RotatePageGridProps) {
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
              variant="rotate"
              isSelected={selectedPages.has(pageNumber)}
              isDisabled={disabled}
              onToggleSelect={() => onToggleSelect(pageNumber)}
              onPreview={() => onPreview(pageNumber)}
              rotationDegrees={rotations[pageNumber] ?? 0}
              onRotateLeft={() => onRotatePage(pageNumber, -90)}
              onRotateRight={() => onRotatePage(pageNumber, 90)}
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
