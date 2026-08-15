"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, FileArchive } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { CompressLevelPicker } from "@/components/compress/CompressLevelPicker";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useCompressPdf } from "@/hooks/useCompressPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import { formatFileSize } from "@/utils/format";
import type { CompressLevel } from "@/types/pdf";

export function CompressClient() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("recommended");

  const { compress, result, progress, isCompressing, isSuccess, error, reset } = useCompressPdf();

  function startOver() {
    setFile(null);
    setLevel("recommended");
    reset();
  }

  function submit() {
    if (file) compress(file, level);
  }

  if (isSuccess && result) {
    return (
      <CompressSuccess
        downloadUrl={result.download_url}
        originalSize={result.original_size}
        compressedSize={result.compressed_size}
        savedSize={result.saved_size}
        reductionPercent={result.reduction_percent}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <FileArchive className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Compress PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Reduce your PDF&apos;s file size while keeping it readable - choose how aggressive to be.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <UploadDropzone onFileSelected={setFile} isUploading={false} progress={0} selectedFile={file} />

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Compression level</p>
            <CompressLevelPicker value={level} onChange={setLevel} disabled={isCompressing} />

            {isCompressing && (
              <div className="mt-6">
                <ProgressBar label="Compressing" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                label={isCompressing ? "Compressing…" : "Compress PDF"}
                variant="primary"
                isDisabled={isCompressing}
                onClick={submit}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CompressSuccess({
  downloadUrl,
  originalSize,
  compressedSize,
  savedSize,
  reductionPercent,
  onStartOver,
}: {
  downloadUrl: string;
  originalSize: number;
  compressedSize: number;
  savedSize: number;
  reductionPercent: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "compressed.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is compressed</h1>
      <p className="mt-2 text-white/55">
        Reduced by {reductionPercent}% ({formatFileSize(savedSize)} saved).
      </p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={4}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Original</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatFileSize(originalSize)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Compressed</p>
              <p className="mt-1 text-lg font-semibold text-success">{formatFileSize(compressedSize)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Reduction</p>
              <p className="mt-1 text-lg font-semibold text-primary-400">{reductionPercent}%</p>
            </div>
          </div>

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

      <Button label="Compress another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
