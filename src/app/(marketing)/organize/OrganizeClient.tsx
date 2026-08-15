"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, LayoutGrid, RotateCcw } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { OrganizePageGrid } from "@/components/organize/OrganizePageGrid";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useOrganizePdf } from "@/hooks/useOrganizePdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export function OrganizeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);

  const { organize, result, progress, isOrganizing, isSuccess, error, reset } = useOrganizePdf();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageOrder([]);
    setSelectedPages(new Set());
  }

  function handleDocumentLoaded(pageCount: number) {
    setPageOrder(Array.from({ length: pageCount }, (_, i) => i + 1));
  }

  function toggleSelect(pageNumber: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  }

  function resetOrder() {
    setPageOrder((current) => [...current].sort((a, b) => a - b));
  }

  function startOver() {
    setFile(null);
    setPageOrder([]);
    setSelectedPages(new Set());
    reset();
  }

  if (isSuccess && result) {
    return <OrganizeSuccess downloadUrl={result.download_url} pageCount={result.page_count} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <LayoutGrid className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Organize PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Drag pages to reorder them, then generate a new PDF in that order.
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
                {pageOrder.length > 0
                  ? `${pageOrder.length} page${pageOrder.length === 1 ? "" : "s"}`
                  : "Loading pages…"}
                {selectedPages.size > 0 && ` · Selected: ${selectedPages.size}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPages.size > 0 ? (
                  <Button label="Clear selection" variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())} />
                ) : (
                  <Button
                    label="Select all"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPages(new Set(pageOrder))}
                    isDisabled={pageOrder.length === 0}
                  />
                )}
                <Button
                  label="Reset order"
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={resetOrder}
                  isDisabled={pageOrder.length === 0}
                />
              </div>
            </div>
            <p className="mb-4 text-xs text-white/35">
              Selection is for preview only - reordering always includes every page; no pages are removed.
            </p>

            <OrganizePageGrid
              file={file}
              pageOrder={pageOrder}
              onReorder={setPageOrder}
              selectedPages={selectedPages}
              onToggleSelect={toggleSelect}
              previewPageNumber={previewPageNumber}
              onPreview={setPreviewPageNumber}
              onClosePreview={() => setPreviewPageNumber(null)}
              onDocumentLoaded={handleDocumentLoaded}
              disabled={isOrganizing}
            />

            {isOrganizing && (
              <div className="mt-6">
                <ProgressBar label="Organizing" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isOrganizing} />
              <Button
                label={isOrganizing ? "Organizing…" : "Organize PDF"}
                variant="primary"
                isDisabled={pageOrder.length === 0 || isOrganizing}
                onClick={() => file && organize(file, pageOrder)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OrganizeSuccess({
  downloadUrl,
  pageCount,
  onStartOver,
}: {
  downloadUrl: string;
  pageCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "organized.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
        Your PDF is organized
      </h1>
      <p className="mt-2 text-white/55">{pageCount} pages in your new order.</p>

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

      <Button label="Organize another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
