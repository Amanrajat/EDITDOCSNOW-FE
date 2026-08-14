"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { List } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { ResizeHandle, useResizable } from "@astryxdesign/core/Resizable";

import { PDFViewer } from "@/components/editor/PDFViewer";
import { Sidebar } from "@/components/editor/Sidebar";
import { Toolbar } from "@/components/editor/Toolbar";
import { DownloadDialog } from "@/components/editor/DownloadDialog";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { SkeletonViewer } from "@/components/feedback/SkeletonViewer";

import { useDocument } from "@/hooks/useDocument";
import { useExtract } from "@/hooks/useExtract";
import { useSave } from "@/hooks/useSave";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useDocumentStore } from "@/store/document.store";
import { resolveMediaUrl } from "@/lib/api";
import type { DocumentBlock } from "@/types/document";

export default function EditorPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;
  const router = useRouter();

  const { document: fetchedDocument, isLoading, isError, refetch } = useDocument(documentId);
  const { extract, isExtracting } = useExtract();
  const { save, saveAsync, isSaving } = useSave(documentId);

  const storeDocument = useDocumentStore((state) => state.document);
  const blocks = useDocumentStore((state) => state.blocks);
  const setDocument = useDocumentStore((state) => state.setDocument);
  const selectBlock = useDocumentStore((state) => state.selectBlock);
  const undo = useDocumentStore((state) => state.undo);
  const redo = useDocumentStore((state) => state.redo);
  const resetEdits = useDocumentStore((state) => state.resetEdits);
  const canUndo = useDocumentStore((state) => state.undoStack.length > 0);
  const canRedo = useDocumentStore((state) => state.redoStack.length > 0);
  const isDirty = useDocumentStore((state) => state.isDirty());
  const downloadUrl = useDocumentStore((state) => state.downloadUrl);

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hasTriggeredExtract, setHasTriggeredExtract] = useState(false);

  const totalPages = storeDocument?.total_pages ?? 1;
  const viewer = usePdfViewer(totalPages);

  const sidebar = useResizable({
    defaultSize: 380,
    minSizePx: 300,
    maxSizePx: 560,
    autoSaveId: "editdocsnow-sidebar",
  });

  useUnsavedChangesWarning(isDirty);
  useKeyboardShortcuts({
    onSave: () => !isSaving && save(),
    onUndo: undo,
    onRedo: redo,
  });

  useEffect(() => {
    if (fetchedDocument && fetchedDocument.id !== storeDocument?.id) {
      setDocument(fetchedDocument);
      setHasTriggeredExtract(false);
    }
  }, [fetchedDocument, storeDocument?.id, setDocument]);

  useEffect(() => {
    if (
      storeDocument &&
      storeDocument.status !== "failed" &&
      blocks.length === 0 &&
      !isExtracting &&
      !hasTriggeredExtract
    ) {
      setHasTriggeredExtract(true);
      extract(storeDocument.id);
    }
  }, [storeDocument, blocks.length, isExtracting, hasTriggeredExtract, extract]);

  async function handleSave() {
    try {
      await saveAsync();
      setIsDownloadDialogOpen(true);
    } catch {
      // Surfaced via toast in useSave.
    }
  }

  function handleSelectBlock(block: DocumentBlock) {
    selectBlock(block.id);
    if (block.page_number !== viewer.currentPage) {
      viewer.goToPage(block.page_number);
    }
    setIsMobileSidebarOpen(false);
  }

  if (isLoading) {
    return <SkeletonViewer />;
  }

  if (isError || !storeDocument) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorCard
          message="We couldn't load this document. It may have been removed, or the backend may be unreachable."
          onRetry={() => refetch()}
          onSecondaryAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  if (storeDocument.status === "failed") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorCard
          title="This document failed to process"
          message={storeDocument.error_message || "The uploaded file could not be parsed as a PDF."}
          onSecondaryAction={() => router.push("/upload")}
          secondaryActionLabel="Upload another file"
        />
      </div>
    );
  }

  const fileUrl = resolveMediaUrl(storeDocument.original_file);

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        viewer={viewer}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={resetEdits}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        downloadUrl={downloadUrl}
        onDownload={() => downloadUrl && setIsDownloadDialogOpen(true)}
      />

      {isExtracting && (
        <Banner status="info" title="Extracting text blocks…" description="This usually takes a few seconds." />
      )}
      {!isExtracting && blocks.length === 0 && (
        <Banner
          status="warning"
          title="No editable text blocks were found"
          description="This PDF may be image-based or contain no extractable text."
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <PDFViewer fileUrl={fileUrl} blocks={blocks} viewer={viewer} />
        </div>

        <ResizeHandle
          resizable={sidebar.props}
          direction="horizontal"
          hasDivider
          isReversed
          className="hidden lg:block"
        />

        <div
          style={{ width: sidebar.size }}
          className="hidden shrink-0 border-l border-border bg-surface lg:flex"
        >
          <Sidebar blocks={blocks} totalPages={totalPages} onSelectBlock={handleSelectBlock} />
        </div>
      </div>

      <Button
        label="Text blocks"
        icon={<List className="h-4 w-4" />}
        variant="primary"
        className="fixed bottom-6 right-6 z-30 shadow-glass lg:hidden"
        onClick={() => setIsMobileSidebarOpen(true)}
      />

      <Dialog isOpen={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen} variant="fullscreen">
        <div className="flex h-full flex-col">
          <DialogHeader title="Text blocks" onOpenChange={setIsMobileSidebarOpen} />
          <div className="min-h-0 flex-1">
            <Sidebar blocks={blocks} totalPages={totalPages} onSelectBlock={handleSelectBlock} />
          </div>
        </div>
      </Dialog>

      {downloadUrl && (
        <DownloadDialog
          isOpen={isDownloadDialogOpen}
          onOpenChange={setIsDownloadDialogOpen}
          downloadUrl={downloadUrl}
          filename={storeDocument.original_name}
          documentId={storeDocument.id}
        />
      )}
    </div>
  );
}
