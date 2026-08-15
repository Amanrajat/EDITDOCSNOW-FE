"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Copy, Crop as CropIcon, Download, ExternalLink } from "lucide-react";
import { Document, Page } from "react-pdf";
import "@/lib/pdf-worker";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Spinner } from "@astryxdesign/core/Spinner";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { CropOverlay } from "@/components/crop/CropOverlay";
import { CropPageSelector } from "@/components/crop/CropPageSelector";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useCropPdf } from "@/hooks/useCropPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import type { CropRect } from "@/types/pdf";

const REFERENCE_WIDTH = 460;
const FULL_PAGE: CropRect = { x0: 0, y0: 0, x1: 1, y1: 1 };
const DEFAULT_RECT: CropRect = { x0: 0.05, y0: 0.05, x1: 0.95, y1: 0.95 };

function marginRect(marginFraction: number): CropRect {
  return { x0: marginFraction, y0: marginFraction, x1: 1 - marginFraction, y1: 1 - marginFraction };
}

export function CropClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [referencePage, setReferencePage] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect>(DEFAULT_RECT);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);

  const { crop, result, progress, isCropping, isSuccess, error, reset } = useCropPdf();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageCount(0);
    setReferencePage(1);
    setNaturalSize(null);
    setRect(DEFAULT_RECT);
    setSelectedPages(new Set());
  }

  function startOver() {
    setFile(null);
    setPageCount(0);
    setReferencePage(1);
    setNaturalSize(null);
    setRect(DEFAULT_RECT);
    setSelectedPages(new Set());
    reset();
  }

  function toggleSelect(pageNumber: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  }

  const renderedHeight = naturalSize
    ? REFERENCE_WIDTH * (naturalSize.height / naturalSize.width)
    : undefined;

  const targetPages = selectedPages.size > 0 ? Array.from(selectedPages).sort((a, b) => a - b) : undefined;
  const canSubmit = !!file && pageCount > 0 && !isCropping;

  function submit() {
    if (file) crop(file, rect, targetPages);
  }

  if (isSuccess && result) {
    return (
      <CropSuccess
        downloadUrl={result.download_url}
        croppedCount={result.cropped_pages.length}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <CropIcon className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Crop PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Drag the crop rectangle to trim your PDF, then apply it to some or all pages.
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
            <div className="grid gap-8 md:grid-cols-[1fr_320px]">
              <div className="flex flex-col items-center">
                <div className="mb-3 flex items-center gap-3">
                  <IconButton
                    label="Previous page"
                    icon={<ChevronLeft className="h-4 w-4" />}
                    variant="ghost"
                    size="sm"
                    isDisabled={referencePage <= 1}
                    onClick={() => {
                      setReferencePage((p) => Math.max(1, p - 1));
                      setNaturalSize(null);
                    }}
                  />
                  <span className="text-sm text-white/55">
                    Page {referencePage} of {pageCount || "…"}
                  </span>
                  <IconButton
                    label="Next page"
                    icon={<ChevronRight className="h-4 w-4" />}
                    variant="ghost"
                    size="sm"
                    isDisabled={pageCount === 0 || referencePage >= pageCount}
                    onClick={() => {
                      setReferencePage((p) => Math.min(pageCount, p + 1));
                      setNaturalSize(null);
                    }}
                  />
                </div>

                <Document file={file} onLoadSuccess={({ numPages }) => setPageCount(numPages)}>
                  <div
                    className="relative inline-block bg-white shadow-soft"
                    style={{ width: REFERENCE_WIDTH, height: renderedHeight, lineHeight: 0 }}
                  >
                    <Page
                      pageNumber={referencePage}
                      width={REFERENCE_WIDTH}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={
                        <div className="flex h-[600px] w-[460px] items-center justify-center">
                          <Spinner size="lg" label="Rendering page…" />
                        </div>
                      }
                      onLoadSuccess={(page) => {
                        const viewport = page.getViewport({ scale: 1 });
                        setNaturalSize({ width: viewport.width, height: viewport.height });
                      }}
                    />
                    {naturalSize && renderedHeight && (
                      <CropOverlay
                        containerWidth={REFERENCE_WIDTH}
                        containerHeight={renderedHeight}
                        rect={rect}
                        onChange={setRect}
                        disabled={isCropping}
                      />
                    )}
                  </div>
                </Document>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button label="Reset crop" variant="ghost" size="sm" onClick={() => setRect(FULL_PAGE)} isDisabled={isCropping} />
                  <Button label="5% margin" variant="ghost" size="sm" onClick={() => setRect(marginRect(0.05))} isDisabled={isCropping} />
                  <Button label="10% margin" variant="ghost" size="sm" onClick={() => setRect(marginRect(0.1))} isDisabled={isCropping} />
                  <Button label="20% margin" variant="ghost" size="sm" onClick={() => setRect(marginRect(0.2))} isDisabled={isCropping} />
                </div>
                <p className="mt-2 text-xs text-white/35">
                  Crop rect: {Math.round(rect.x0 * 100)}%, {Math.round(rect.y0 * 100)}% →{" "}
                  {Math.round(rect.x1 * 100)}%, {Math.round(rect.y1 * 100)}%
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                    Apply to {selectedPages.size > 0 ? `${selectedPages.size} selected page${selectedPages.size === 1 ? "" : "s"}` : "all pages"}
                  </p>
                  {selectedPages.size > 0 && (
                    <Button label="Clear" variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())} />
                  )}
                </div>
                <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border p-2">
                  {file && (
                    <CropPageSelector
                      file={file}
                      selectedPages={selectedPages}
                      onToggleSelect={toggleSelect}
                      previewPageNumber={previewPageNumber}
                      onPreview={setPreviewPageNumber}
                      onClosePreview={() => setPreviewPageNumber(null)}
                      onDocumentLoaded={() => {}}
                      disabled={isCropping}
                    />
                  )}
                </div>
              </div>
            </div>

            {isCropping && (
              <div className="mt-6">
                <ProgressBar label="Cropping" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isCropping} />
              <Button
                label={isCropping ? "Cropping…" : "Apply crop"}
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

function CropSuccess({
  downloadUrl,
  croppedCount,
  onStartOver,
}: {
  downloadUrl: string;
  croppedCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "cropped.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">PDF cropped</h1>
      <p className="mt-2 text-white/55">
        {croppedCount} page{croppedCount === 1 ? "" : "s"} cropped · your original file was not modified.
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

      <Button label="Crop another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
