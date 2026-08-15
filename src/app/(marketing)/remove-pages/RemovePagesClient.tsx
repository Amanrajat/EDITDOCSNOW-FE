"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, FileMinus2 } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { RemovePagesGrid } from "@/components/pdf-pages/RemovePagesGrid";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRemovePages } from "@/hooks/useRemovePages";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export function RemovePagesClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesToRemove, setPagesToRemove] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { removePages, result, progress, isRemoving, isSuccess, error, reset } = useRemovePages();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageCount(0);
    setPagesToRemove(new Set());
  }

  function toggleMarked(pageNumber: number) {
    setPagesToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  }

  function startOver() {
    setFile(null);
    setPageCount(0);
    setPagesToRemove(new Set());
    reset();
  }

  const wouldRemoveEveryPage = pageCount > 0 && pagesToRemove.size >= pageCount;
  const canSubmit = pagesToRemove.size > 0 && !wouldRemoveEveryPage && !isRemoving;
  const sortedMarked = Array.from(pagesToRemove).sort((a, b) => a - b);

  function confirmAndSubmit() {
    setIsConfirmOpen(false);
    if (file) removePages(file, sortedMarked);
  }

  if (isSuccess && result) {
    return (
      <RemovePagesSuccess
        downloadUrl={result.download_url}
        outputPageCount={result.output_page_count}
        removedCount={result.removed_pages.length}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <FileMinus2 className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Remove Pages</h1>
      <p className="mt-2 text-center text-white/55">
        Mark the pages you want to delete, then generate a new PDF without them.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        {!file && <UploadDropzone onFileSelected={handleFileSelected} isUploading={false} progress={0} selectedFile={null} />}

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">
                {pageCount > 0 ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "Loading pages…"}
                {pagesToRemove.size > 0 && ` · Marked for removal: ${pagesToRemove.size}`}
              </p>
              {pagesToRemove.size > 0 && (
                <Button label="Clear marks" variant="ghost" size="sm" onClick={() => setPagesToRemove(new Set())} />
              )}
            </div>

            {wouldRemoveEveryPage && (
              <p className="mb-4 text-xs text-danger">
                You can&apos;t remove every page - leave at least one, or clear some marks.
              </p>
            )}

            <RemovePagesGrid
              file={file}
              pagesToRemove={pagesToRemove}
              onToggleMarked={toggleMarked}
              previewPageNumber={previewPageNumber}
              onPreview={setPreviewPageNumber}
              onClosePreview={() => setPreviewPageNumber(null)}
              onDocumentLoaded={setPageCount}
              disabled={isRemoving}
            />

            {isRemoving && (
              <div className="mt-6">
                <ProgressBar label="Removing pages" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isRemoving} />
              <Button
                label={
                  isRemoving
                    ? "Removing…"
                    : `Remove ${pagesToRemove.size} page${pagesToRemove.size === 1 ? "" : "s"}`
                }
                variant="primary"
                isDisabled={!canSubmit}
                onClick={() => setIsConfirmOpen(true)}
              />
            </div>
          </motion.div>
        )}
      </div>

      <Dialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} width={420} purpose="required">
        <Layout
          header={<DialogHeader title="Remove these pages?" onOpenChange={setIsConfirmOpen} />}
          content={
            <LayoutContent>
              <p className="text-sm text-white/60">
                Page{sortedMarked.length === 1 ? "" : "s"} {sortedMarked.join(", ")} will be deleted
                from a new copy of this PDF. Your original file is not modified.
              </p>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <div className="flex w-full justify-end gap-2">
                <Button label="Cancel" variant="ghost" onClick={() => setIsConfirmOpen(false)} />
                <Button label="Remove pages" variant="destructive" onClick={confirmAndSubmit} />
              </div>
            </LayoutFooter>
          }
        />
      </Dialog>
    </div>
  );
}

function RemovePagesSuccess({
  downloadUrl,
  outputPageCount,
  removedCount,
  onStartOver,
}: {
  downloadUrl: string;
  outputPageCount: number;
  removedCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "pages_removed.pdf");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
      >
        <Check className="h-10 w-10" aria-hidden />
      </motion.div>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Pages removed</h1>
      <p className="mt-2 text-white/55">
        Removed {removedCount} page{removedCount === 1 ? "" : "s"} · {outputPageCount} page
        {outputPageCount === 1 ? "" : "s"} remaining.
      </p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              label="Download"
              variant="primary"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
            />
            <Button
              label="Open PDF"
              variant="secondary"
              icon={<ExternalLink className="h-4 w-4" />}
              href={`${downloadUrl}&disposition=inline`}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Button
              label={copied ? "Copied" : "Copy link"}
              variant="ghost"
              icon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              onClick={handleCopy}
            />
          </div>
        </VStack>
      </Card>

      <Button label="Remove pages from another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
