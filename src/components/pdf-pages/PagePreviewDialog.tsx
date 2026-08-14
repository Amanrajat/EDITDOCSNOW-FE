"use client";

import { Page } from "react-pdf";
import "@/lib/pdf-worker";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { Spinner } from "@astryxdesign/core/Spinner";

interface PagePreviewDialogProps {
  pageNumber: number | null;
  onOpenChange: (isOpen: boolean) => void;
}

export function PagePreviewDialog({ pageNumber, onOpenChange }: PagePreviewDialogProps) {
  return (
    <Dialog isOpen={pageNumber !== null} onOpenChange={onOpenChange} width={480} purpose="info">
      <Layout
        header={
          <DialogHeader
            title={pageNumber !== null ? `Page ${pageNumber}` : "Preview"}
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <div className="flex justify-center">
              {pageNumber !== null && (
                <Page
                  pageNumber={pageNumber}
                  width={420}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading={
                    <div className="flex h-[540px] w-[420px] items-center justify-center">
                      <Spinner size="lg" label="Rendering page…" />
                    </div>
                  }
                />
              )}
            </div>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
