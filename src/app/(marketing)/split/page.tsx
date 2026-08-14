"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Scissors } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { SegmentedControl } from "@astryxdesign/core/SegmentedControl";
import { SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { TextInput } from "@astryxdesign/core/TextInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useSplitPdf } from "@/hooks/useSplitPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import type { SplitMode } from "@/types/pdf";

function parsePageList(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .map((token) => Number.parseInt(token, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>("all_pages");
  const [ranges, setRanges] = useState("");
  const [n, setN] = useState<number | null>(5);
  const [pagesText, setPagesText] = useState("");

  const { split, result, progress, isSplitting, isSuccess, error, reset } = useSplitPdf();

  function startOver() {
    setFile(null);
    reset();
  }

  function handleSubmit() {
    if (!file) return;

    if (mode === "ranges") {
      split(file, { mode, ranges });
    } else if (mode === "every_n") {
      split(file, { mode, n: n ?? undefined });
    } else if (mode === "extract") {
      split(file, { mode, pages: parsePageList(pagesText) });
    } else {
      split(file, { mode });
    }
  }

  const canSubmit =
    !!file &&
    !isSplitting &&
    (mode === "all_pages" ||
      (mode === "ranges" && ranges.trim().length > 0) ||
      (mode === "every_n" && !!n && n > 0) ||
      (mode === "extract" && parsePageList(pagesText).length > 0));

  if (isSuccess && result) {
    return <SplitSuccess result={result} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Scissors className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Split PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Break a PDF into individual pages, custom ranges, or extract specific pages.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <UploadDropzone
          onFileSelected={setFile}
          isUploading={false}
          progress={0}
          selectedFile={file}
        />

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
            <SegmentedControl label="Split mode" value={mode} onChange={(value) => setMode(value as SplitMode)}>
              <SegmentedControlItem value="all_pages" label="Every page" />
              <SegmentedControlItem value="ranges" label="Custom ranges" />
              <SegmentedControlItem value="every_n" label="Every N pages" />
              <SegmentedControlItem value="extract" label="Extract pages" />
            </SegmentedControl>

            <div className="mt-5">
              {mode === "ranges" && (
                <TextInput
                  label="Page ranges"
                  description='e.g. "1-5,6-10,11" — each range becomes its own PDF, zipped together'
                  value={ranges}
                  onChange={setRanges}
                  placeholder="1-5,6-10,11"
                />
              )}

              {mode === "every_n" && (
                <NumberInput
                  label="Pages per file"
                  description="Split into consecutive chunks of this many pages"
                  value={n}
                  onChange={setN}
                  min={1}
                  isIntegerOnly
                />
              )}

              {mode === "extract" && (
                <TextInput
                  label="Pages to extract"
                  description="e.g. '1, 3, 5' — combined into a single PDF, in this order"
                  value={pagesText}
                  onChange={setPagesText}
                  placeholder="1, 3, 5"
                />
              )}

              {mode === "all_pages" && (
                <p className="text-sm text-white/50">
                  Every page becomes its own PDF, zipped together.
                </p>
              )}
            </div>

            {isSplitting && (
              <div className="mt-5">
                <ProgressBar label="Splitting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                label={isSplitting ? "Splitting…" : "Split PDF"}
                variant="primary"
                isDisabled={!canSubmit}
                onClick={handleSubmit}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SplitSuccess({
  result,
  onStartOver,
}: {
  result: { download_url: string; is_zip: boolean; output_count: number; source_pages: number };
  onStartOver: () => void;
}) {
  const filename = result.is_zip ? "split_result.zip" : "split.pdf";
  const { copied, handleDownload, handleCopy } = useDownloadActions(result.download_url, filename);

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is split</h1>
      <p className="mt-2 text-white/55">
        {result.output_count} file{result.output_count === 1 ? "" : "s"} generated from{" "}
        {result.source_pages} page{result.source_pages === 1 ? "" : "s"}
        {result.is_zip ? " (zipped)." : "."}
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

      <Button label="Split another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
