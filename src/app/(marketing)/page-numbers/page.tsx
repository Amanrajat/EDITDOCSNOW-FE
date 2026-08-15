"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Hash } from "lucide-react";
import { Document, Page } from "react-pdf";
import "@/lib/pdf-worker";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Spinner } from "@astryxdesign/core/Spinner";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { TextInput } from "@astryxdesign/core/TextInput";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PageNumberPageSelector } from "@/components/page-numbers/PageNumberPageSelector";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { usePageNumbers } from "@/hooks/usePageNumbers";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import { cn } from "@/utils/cn";
import type { PageNumberOptions, PageNumberPosition } from "@/types/pdf";

const REFERENCE_WIDTH = 460;

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const DEFAULT_OPTIONS: PageNumberOptions = {
  startNumber: 1,
  position: "bottom-center",
  fontSize: 12,
  fontColor: "#000000",
  margin: 28,
  prefix: "",
  suffix: "",
};

function badgeStyle(position: PageNumberPosition, marginPx: number): React.CSSProperties {
  const style: React.CSSProperties = { position: "absolute" };
  if (position.startsWith("top")) style.top = marginPx;
  else style.bottom = marginPx;

  if (position.endsWith("left")) style.left = marginPx;
  else if (position.endsWith("right")) style.right = marginPx;
  else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }
  return style;
}

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [options, setOptions] = useState<PageNumberOptions>(DEFAULT_OPTIONS);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);

  const { addPageNumbers, result, progress, isAdding, isSuccess, error, reset } = usePageNumbers();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPageCount(0);
    setNaturalSize(null);
    setSelectedPages(new Set());
  }

  function startOver() {
    setFile(null);
    setPageCount(0);
    setNaturalSize(null);
    setOptions(DEFAULT_OPTIONS);
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

  function update<K extends keyof PageNumberOptions>(key: K, value: PageNumberOptions[K]) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  const renderedHeight = naturalSize
    ? REFERENCE_WIDTH * (naturalSize.height / naturalSize.width)
    : undefined;
  const marginPx = naturalSize ? options.margin * (REFERENCE_WIDTH / naturalSize.width) : 0;
  const previewLabel = `${options.prefix}${options.startNumber}${options.suffix}`;

  const targetPages = selectedPages.size > 0 ? Array.from(selectedPages).sort((a, b) => a - b) : undefined;
  const canSubmit = !!file && pageCount > 0 && !isAdding;

  function submit() {
    if (file) addPageNumbers(file, options, targetPages);
  }

  if (isSuccess && result) {
    return (
      <PageNumbersSuccess
        downloadUrl={result.download_url}
        numberedCount={result.numbered_pages.length}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Hash className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Page Numbers</h1>
      <p className="mt-2 text-center text-white/55">
        Stamp page numbers onto your PDF - choose position, style, and which pages to number.
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
                <Document file={file} onLoadSuccess={({ numPages }) => setPageCount(numPages)}>
                  <div
                    className="relative inline-block bg-white shadow-soft"
                    style={{ width: REFERENCE_WIDTH, height: renderedHeight, lineHeight: 0 }}
                  >
                    <Page
                      pageNumber={1}
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
                    {naturalSize && (
                      <span
                        data-page-number-preview
                        style={{
                          ...badgeStyle(options.position, marginPx),
                          fontSize: Math.max(10, options.fontSize * (REFERENCE_WIDTH / naturalSize.width)),
                          color: options.fontColor,
                          // The page-preview wrapper sets line-height: 0 to
                          // avoid extra gap under the <Page> canvas: since
                          // line-height inherits, this badge needs its own
                          // normal line-height or its box collapses to
                          // zero height (invisible despite non-empty text).
                          lineHeight: "normal",
                        }}
                        className="whitespace-nowrap font-medium"
                      >
                        {previewLabel}
                      </span>
                    )}
                  </div>
                </Document>
                <p className="mt-3 text-xs text-white/35">Preview shown on page 1 - actual placement repeats on every numbered page.</p>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Position</p>
                  <div className="grid grid-cols-3 gap-2">
                    {POSITIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("position", value)}
                        aria-pressed={options.position === value}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-xs transition-colors",
                          options.position === value
                            ? "border-primary bg-primary/10 text-primary-400"
                            : "border-border text-white/55 hover:border-white/30",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <NumberInput
                  label="Start number"
                  value={options.startNumber}
                  onChange={(value) => update("startNumber", value ?? 1)}
                  isIntegerOnly
                />
                <NumberInput
                  label="Font size"
                  value={options.fontSize}
                  onChange={(value) => update("fontSize", value ?? 12)}
                  min={6}
                  max={72}
                  isIntegerOnly
                />
                <NumberInput
                  label="Margin (pt)"
                  value={options.margin}
                  onChange={(value) => update("margin", value ?? 28)}
                  min={0}
                  max={150}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="page-number-color">
                    Font color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="page-number-color"
                      type="color"
                      value={options.fontColor}
                      onChange={(event) => update("fontColor", event.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                    <TextInput
                      label="Font color hex value"
                      isLabelHidden
                      value={options.fontColor}
                      onChange={(value) => update("fontColor", value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <TextInput label="Prefix" value={options.prefix} onChange={(value) => update("prefix", value)} placeholder="Page " />
                <TextInput label="Suffix" value={options.suffix} onChange={(value) => update("suffix", value)} placeholder=" of 10" />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                      Number {selectedPages.size > 0 ? `${selectedPages.size} selected page${selectedPages.size === 1 ? "" : "s"}` : "all pages"}
                    </p>
                    {selectedPages.size > 0 && (
                      <Button label="Clear" variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())} />
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto rounded-xl border border-border p-2">
                    <PageNumberPageSelector
                      file={file}
                      selectedPages={selectedPages}
                      onToggleSelect={toggleSelect}
                      previewPageNumber={previewPageNumber}
                      onPreview={setPreviewPageNumber}
                      onClosePreview={() => setPreviewPageNumber(null)}
                      onDocumentLoaded={() => {}}
                      disabled={isAdding}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isAdding && (
              <div className="mt-6">
                <ProgressBar label="Adding page numbers" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button label="Choose a different file" variant="ghost" onClick={startOver} isDisabled={isAdding} />
              <Button
                label={isAdding ? "Adding…" : "Add page numbers"}
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

function PageNumbersSuccess({
  downloadUrl,
  numberedCount,
  onStartOver,
}: {
  downloadUrl: string;
  numberedCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "numbered.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Page numbers added</h1>
      <p className="mt-2 text-white/55">
        {numberedCount} page{numberedCount === 1 ? "" : "s"} numbered · your original file was not modified.
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

      <Button label="Number another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
