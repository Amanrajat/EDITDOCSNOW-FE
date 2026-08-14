"use client";

import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "@/lib/pdf-worker";
import { FileWarning } from "lucide-react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { SkeletonViewer } from "@/components/feedback/SkeletonViewer";
import { TextOverlay } from "@/components/editor/TextOverlay";
import type { usePdfViewer } from "@/hooks/usePdfViewer";
import type { DocumentBlock } from "@/types/document";

interface PDFViewerProps {
  fileUrl: string;
  blocks: DocumentBlock[];
  viewer: ReturnType<typeof usePdfViewer>;
}

export function PDFViewer({ fileUrl, blocks, viewer }: PDFViewerProps) {
  const { containerRef, currentPage, zoom, rotation, pageSize, setPageSize } = viewer;
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setPageSize(null);
  }, [currentPage, setPageSize]);

  const renderedWidth = pageSize ? pageSize.width * zoom : undefined;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-start justify-center overflow-auto bg-black/40 p-8"
    >
      <Document
        file={fileUrl}
        loading={<SkeletonViewer />}
        error={
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white/55">
            <FileWarning className="h-8 w-8 text-danger" />
            <p className="text-sm">Could not load this PDF file.</p>
          </div>
        }
        onLoadError={(error) => setLoadError(error.message)}
      >
        {!loadError && (
          <div className="relative inline-block rounded-lg bg-white shadow-soft" style={{ lineHeight: 0 }}>
            <Page
              pageIndex={currentPage}
              width={renderedWidth}
              rotate={rotation}
              renderAnnotationLayer
              renderTextLayer={false}
              loading={
                <div className="flex h-[600px] w-[460px] items-center justify-center">
                  <Spinner size="lg" label="Rendering page…" />
                </div>
              }
              onLoadSuccess={(page) => {
                const viewport = page.getViewport({ scale: 1, rotation: 0 });
                setPageSize({ width: viewport.width, height: viewport.height });
              }}
            />
            {pageSize && rotation === 0 && (
              <TextOverlay
                blocks={blocks.filter((block) => block.page_number === currentPage)}
                scale={zoom}
              />
            )}
          </div>
        )}
      </Document>
    </div>
  );
}
