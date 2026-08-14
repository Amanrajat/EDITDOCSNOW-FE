"use client";

import { useState, type DragEvent } from "react";
import { Document } from "react-pdf";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { PageThumbnail } from "@/components/pdf-pages/PageThumbnail";
import { PagePreviewDialog } from "@/components/pdf-pages/PagePreviewDialog";

interface OrganizePageGridProps {
  file: File;
  /** Current output order, 1-based original page numbers. */
  pageOrder: number[];
  onReorder: (order: number[]) => void;
  selectedPages: Set<number>;
  onToggleSelect: (pageNumber: number) => void;
  previewPageNumber: number | null;
  onPreview: (pageNumber: number) => void;
  onClosePreview: () => void;
  onDocumentLoaded: (pageCount: number) => void;
  disabled?: boolean;
}

export function OrganizePageGrid({
  file,
  pageOrder,
  onReorder,
  selectedPages,
  onToggleSelect,
  previewPageNumber,
  onPreview,
  onClosePreview,
  onDocumentLoaded,
  disabled,
}: OrganizePageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= pageOrder.length || from === to) return;
    const next = [...pageOrder];
    const [moved] = next.splice(from, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    onReorder(next);
  }

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
      onLoadSuccess={({ numPages }) => onDocumentLoaded(numPages)}
      onLoadError={(error) => setLoadError(error.message)}
    >
      {!loadError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pageOrder.map((pageNumber, index) => (
            <PageThumbnail
              key={pageNumber}
              pageNumber={pageNumber}
              position={index + 1}
              isSelected={selectedPages.has(pageNumber)}
              isDragging={draggedIndex === index}
              isDisabled={disabled}
              onToggleSelect={() => onToggleSelect(pageNumber)}
              onPreview={() => onPreview(pageNumber)}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
              onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                if (draggedIndex !== null) move(draggedIndex, index);
                setDraggedIndex(null);
              }}
              onDragEnd={() => setDraggedIndex(null)}
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
