"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  RotateCcw,
  RotateCw,
  RotateCwSquare,
} from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { RotatePageGrid } from "@/components/rotate/RotatePageGrid";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRotatePdf } from "@/hooks/useRotatePdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);

  const { applyRotations, result, progress, isRotating, isSuccess, error, reset } = useRotatePdf();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageCount(0);
    setRotations({});
    setSelectedPages(new Set());
  }

  function toggleSelect(pageNumber: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  }

  function rotatePage(pageNumber: number, delta: number) {
    setRotations((prev) => ({
      ...prev,
      [pageNumber]: ((prev[pageNumber] ?? 0) + delta + 360) % 360,
    }));
  }

  /** Selecting nothing means "apply to every page" - the common convention
   * for PDF tools (select specific pages to target just those instead). */
  const targetPages = selectedPages.size > 0 ? Array.from(selectedPages) : Array.from({ length: pageCount }, (_, i) => i + 1);

  function rotateBulk(delta: number) {
    setRotations((prev) => {
      const next = { ...prev };
      for (const pageNumber of targetPages) {
        next[pageNumber] = ((next[pageNumber] ?? 0) + delta + 360) % 360;
      }
      return next;
    });
  }

  function resetRotations() {
    setRotations({});
  }

  function startOver() {
    setFile(null);
    setPageCount(0);
    setRotations({});
    setSelectedPages(new Set());
    reset();
  }

  const pendingCount = Object.values(rotations).filter((degrees) => degrees !== 0).length;
  const canSubmit = pendingCount > 0 && !isRotating;

  function submit() {
    if (file) applyRotations(file, rotations);
  }

  if (isSuccess && result) {
    return (
      <RotateSuccess
        downloadUrl={result.download_url}
        rotatedCount={result.rotated_pages.length}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <RotateCwSquare className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Rotate PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Rotate individual pages or the whole document, then download the corrected PDF.
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
                {selectedPages.size > 0
                  ? ` · Rotating ${selectedPages.size} selected page${selectedPages.size === 1 ? "" : "s"}`
                  : " · No pages selected — actions apply to all pages"}
                {pendingCount > 0 && ` · ${pendingCount} page${pendingCount === 1 ? "" : "s"} pending rotation`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPages.size > 0 && (
                  <Button label="Clear selection" variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())} />
                )}
                {pendingCount > 0 && (
                  <Button label="Reset rotations" variant="ghost" size="sm" onClick={resetRotations} />
                )}
              </div>
            </div>

            <div className="glass-card mb-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-border p-3">
              <IconButton
                label="Rotate left 90°"
                icon={<RotateCcw className="h-4 w-4" />}
                variant="secondary"
                size="sm"
                isDisabled={isRotating || pageCount === 0}
                onClick={() => rotateBulk(-90)}
              />
              <IconButton
                label="Rotate right 90°"
                icon={<RotateCw className="h-4 w-4" />}
                variant="secondary"
                size="sm"
                isDisabled={isRotating || pageCount === 0}
                onClick={() => rotateBulk(90)}
              />
              <Button
                label="Rotate 180°"
                variant="secondary"
                size="sm"
                isDisabled={isRotating || pageCount === 0}
                onClick={() => rotateBulk(180)}
              />
            </div>

            <RotatePageGrid
              file={file}
              rotations={rotations}
              selectedPages={selectedPages}
              onToggleSelect={toggleSelect}
              onRotatePage={rotatePage}
              previewPageNumber={previewPageNumber}
              onPreview={setPreviewPageNumber}
              onClosePreview={() => setPreviewPageNumber(null)}
              onDocumentLoaded={setPageCount}
              disabled={isRotating}
            />

            {isRotating && (
              <div className="mt-6">
                <ProgressBar label="Rotating pages" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isRotating} />
              <Button
                label={isRotating ? "Rotating…" : `Apply rotation${pendingCount === 1 ? "" : "s"}`}
                variant="primary"
                isDisabled={!canSubmit}
                onClick={submit}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function RotateSuccess({
  downloadUrl,
  rotatedCount,
  onStartOver,
}: {
  downloadUrl: string;
  rotatedCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "rotated.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">PDF rotated</h1>
      <p className="mt-2 text-white/55">
        {rotatedCount} page{rotatedCount === 1 ? "" : "s"} rotated · your original file was not modified.
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

      <Button label="Rotate another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
