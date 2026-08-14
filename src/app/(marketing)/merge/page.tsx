"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Layers } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { MergeDropzone } from "@/components/merge/MergeDropzone";
import { MergeFileList } from "@/components/merge/MergeFileList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useMergePdf } from "@/hooks/useMergePdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const { merge, result, progress, isMerging, isSuccess, error, reset } = useMergePdf();

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

  if (isSuccess && result) {
    return <MergeSuccess downloadUrl={result.download_url} pageCount={result.total_pages} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Layers className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Merge PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Combine multiple PDFs into one file, in the order you choose.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <MergeDropzone onFilesAdded={addFiles} disabled={isMerging} />

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 w-full"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {files.length} file{files.length === 1 ? "" : "s"} · drag, or use the arrows, to reorder
            </p>
            <MergeFileList
              files={files}
              onReorder={setFiles}
              onRemove={removeFile}
              disabled={isMerging}
            />

            {isMerging && (
              <div className="mt-4">
                <ProgressBar
                  label="Merging"
                  isLabelHidden
                  value={progress}
                  hasValueLabel
                  variant="accent"
                />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                label={isMerging ? "Merging…" : `Merge ${files.length} PDF${files.length === 1 ? "" : "s"}`}
                variant="primary"
                isDisabled={files.length < 2 || isMerging}
                onClick={() => merge(files)}
              />
            </div>
            {files.length === 1 && (
              <p className="mt-2 text-center text-xs text-white/40">
                Add at least one more PDF to merge.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MergeSuccess({
  downloadUrl,
  pageCount,
  onStartOver,
}: {
  downloadUrl: string;
  pageCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "merged.pdf");

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
        Your PDFs are merged
      </h1>
      <p className="mt-2 text-white/55">{pageCount} pages combined into one file.</p>

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

      <Button label="Merge more PDFs" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
