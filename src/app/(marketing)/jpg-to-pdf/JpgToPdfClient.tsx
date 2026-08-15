"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, ImagePlus } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { ImageDropzone } from "@/components/jpg-to-pdf/ImageDropzone";
import { MergeFileList } from "@/components/merge/MergeFileList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useJpgToPdf } from "@/hooks/useJpgToPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

type PageSize = "A4" | "Letter";
type Orientation = "portrait" | "landscape";
type FitMode = "fit" | "fill";

export function JpgToPdfClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [margin, setMargin] = useState<number | null>(0);
  const [quality, setQuality] = useState<number | null>(90);

  const { convert, result, progress, isConverting, isSuccess, error, reset } = useJpgToPdf();

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function startOver() {
    setFiles([]);
    reset();
  }

  function submit() {
    convert(files, {
      pageSize,
      orientation,
      fitMode,
      margin: margin ?? 0,
      quality: fitMode === "fill" ? quality ?? undefined : undefined,
    });
  }

  if (isSuccess && result) {
    return <JpgToPdfSuccess downloadUrl={result.download_url} pageCount={Number(result.page_count ?? files.length)} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <ImagePlus className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">JPG to PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Combine JPG or PNG images into a single PDF, one page per image, in the order you choose.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <ImageDropzone onFilesAdded={addFiles} disabled={isConverting} />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {files.length} image{files.length === 1 ? "" : "s"} · drag, or use the arrows, to reorder
            </p>
            <MergeFileList files={files} onReorder={setFiles} onRemove={removeFile} disabled={isConverting} />

            <div className="glass-card mt-6 flex flex-col gap-5 rounded-xl border border-border p-4">
              <SegmentedControl label="Page size" value={pageSize} onChange={(v) => setPageSize(v as PageSize)}>
                <SegmentedControlItem value="A4" label="A4" />
                <SegmentedControlItem value="Letter" label="Letter" />
              </SegmentedControl>
              <SegmentedControl label="Orientation" value={orientation} onChange={(v) => setOrientation(v as Orientation)}>
                <SegmentedControlItem value="portrait" label="Portrait" />
                <SegmentedControlItem value="landscape" label="Landscape" />
              </SegmentedControl>
              <SegmentedControl label="Fit mode" value={fitMode} onChange={(v) => setFitMode(v as FitMode)}>
                <SegmentedControlItem value="fit" label="Fit (show whole image)" />
                <SegmentedControlItem value="fill" label="Fill (crop to cover page)" />
              </SegmentedControl>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Margin (pt)" value={margin} onChange={setMargin} min={0} max={150} />
                {fitMode === "fill" && (
                  <NumberInput label="JPEG quality" value={quality} onChange={setQuality} min={1} max={100} isIntegerOnly />
                )}
              </div>
            </div>

            {isConverting && (
              <div className="mt-6">
                <ProgressBar label="Converting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                label={isConverting ? "Converting…" : `Create PDF from ${files.length} image${files.length === 1 ? "" : "s"}`}
                variant="primary"
                isDisabled={isConverting}
                onClick={submit}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function JpgToPdfSuccess({
  downloadUrl,
  pageCount,
  onStartOver,
}: {
  downloadUrl: string;
  pageCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "images.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is ready</h1>
      <p className="mt-2 text-white/55">{pageCount} page{pageCount === 1 ? "" : "s"} created from your images.</p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex flex-wrap justify-center gap-2">
            <Button label="Download" variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleDownload} />
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

      <Button label="Convert more images" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
