"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { JpgPageSelector } from "@/components/convert/JpgPageSelector";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useConvertPdfToJpg } from "@/hooks/useConvertPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);
  const [dpi, setDpi] = useState<number | null>(150);
  const [quality, setQuality] = useState<number | null>(90);

  const { convert, result, progress, isConverting, isSuccess, error, reset } = useConvertPdfToJpg();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageCount(0);
    setSelectedPages(new Set());
  }

  function startOver() {
    setFile(null);
    setPageCount(0);
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

  const targetPages = selectedPages.size > 0 ? Array.from(selectedPages).sort((a, b) => a - b) : undefined;
  const canSubmit = !!file && pageCount > 0 && !isConverting;

  function submit() {
    if (file) convert(file, { pages: targetPages, dpi: dpi ?? 150, quality: quality ?? 90 });
  }

  if (isSuccess && result) {
    return <PdfToJpgSuccess result={result} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <ImageIcon className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">PDF to JPG</h1>
      <p className="mt-2 text-center text-white/55">
        Render pages of your PDF as JPG images - pick pages, resolution, and quality.
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
                  ? ` · Converting ${selectedPages.size} selected page${selectedPages.size === 1 ? "" : "s"}`
                  : " · No pages selected — every page will be converted"}
              </p>
              {selectedPages.size > 0 && (
                <Button label="Clear selection" variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())} />
              )}
            </div>

            <div className="glass-card mb-5 grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
              <NumberInput label="Resolution (DPI)" value={dpi} onChange={setDpi} min={72} max={600} isIntegerOnly />
              <NumberInput label="JPEG quality" value={quality} onChange={setQuality} min={1} max={100} isIntegerOnly />
            </div>

            <JpgPageSelector
              file={file}
              selectedPages={selectedPages}
              onToggleSelect={toggleSelect}
              previewPageNumber={previewPageNumber}
              onPreview={setPreviewPageNumber}
              onClosePreview={() => setPreviewPageNumber(null)}
              onDocumentLoaded={setPageCount}
              disabled={isConverting}
            />

            {isConverting && (
              <div className="mt-6">
                <ProgressBar label="Converting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isConverting} />
              <Button
                label={isConverting ? "Converting…" : "Convert to JPG"}
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

function PdfToJpgSuccess({
  result,
  onStartOver,
}: {
  result: { download_url: string; converted_pages?: unknown; page_count?: unknown };
  onStartOver: () => void;
}) {
  const isZip = Array.isArray(result.converted_pages) && result.converted_pages.length > 1;
  const { copied, handleDownload, handleCopy } = useDownloadActions(
    result.download_url,
    isZip ? "pdf_to_jpg_result.zip" : "converted.jpg",
  );
  const convertedCount = Array.isArray(result.converted_pages) ? result.converted_pages.length : 1;

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
        {convertedCount === 1 ? "Your image is ready" : "Your images are ready"}
      </h1>
      <p className="mt-2 text-white/55">
        {convertedCount} page{convertedCount === 1 ? "" : "s"} converted to JPG
        {isZip ? " (zipped)." : "."}
      </p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              label={isZip ? "Download ZIP" : "Download"}
              variant="primary"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
            />
            <Button
              label="Open"
              variant="secondary"
              icon={<ExternalLink className="h-4 w-4" />}
              href={`${result.download_url}&disposition=inline`}
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

      <Button label="Convert another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
