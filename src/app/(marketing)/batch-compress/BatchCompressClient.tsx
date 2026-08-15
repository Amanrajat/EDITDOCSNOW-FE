"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Layers3, RotateCcw, X } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { MergeDropzone } from "@/components/merge/MergeDropzone";
import { CompressLevelPicker } from "@/components/compress/CompressLevelPicker";
import { JobStatus } from "@/components/processing/JobStatus";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBatchCompress } from "@/hooks/useBatchCompress";
import { batchStatusQueryOptions } from "@/hooks/useBatchStatus";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import { formatFileSize } from "@/utils/format";
import type { BatchFileEntry, CompressLevel } from "@/types/pdf";

interface TrackedBatch {
  id: string;
  token: string;
}

export function BatchCompressClient() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<CompressLevel>("recommended");
  const [fileOrder, setFileOrder] = useState<string[]>([]);
  const [filesByName, setFilesByName] = useState<Map<string, File>>(new Map());
  const [batches, setBatches] = useState<TrackedBatch[]>([]);

  const { submitBatch, isSubmitting, error, reset } = useBatchCompress();

  const statusQueries = useQueries({
    queries: batches.map((batch) => batchStatusQueryOptions(batch.id, batch.token)),
  });

  function addFiles(newFiles: File[]) {
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function startOver() {
    setPendingFiles([]);
    setFileOrder([]);
    setFilesByName(new Map());
    setBatches([]);
    reset();
  }

  async function submit(filesToSubmit: File[]) {
    const result = await submitBatch(filesToSubmit, level);
    setBatches((prev) => [...prev, { id: result.batch_id, token: result.owner_token }]);
    return result;
  }

  async function handleInitialSubmit() {
    const names = pendingFiles.map((f) => f.name);
    setFileOrder(names);
    setFilesByName(new Map(pendingFiles.map((f) => [f.name, f])));
    await submit(pendingFiles);
    setPendingFiles([]);
  }

  // Merge every tracked batch's file entries by filename - a retry batch
  // (submitted later) overwrites the earlier failed entry for that name,
  // so the row visibly flips from "Failed" to whatever the retry produced.
  const mergedByName = new Map<string, BatchFileEntry>();
  for (const query of statusQueries) {
    const data = query.data;
    if (!data) continue;
    for (const entry of data.files) {
      mergedByName.set(entry.filename, entry);
    }
  }

  const rows = fileOrder.map((name) => mergedByName.get(name) ?? { id: name, order: 0, filename: name, status: "queued" as const });

  const overallDone = batches.length > 0 && statusQueries.every((q) => q.data && ["completed", "partial", "failed"].includes(q.data.status));
  const failedRows = rows.filter((r) => r.status === "failed");
  const completedCount = rows.filter((r) => r.status === "completed").length;

  // Latest batch that actually has a download URL - if a retry batch
  // produced new successes, prefer its ZIP (union semantics would need
  // server support we don't have; this at least surfaces the most recent
  // successful run rather than a stale/empty one).
  const latestDownloadUrl = useMemo(() => {
    for (let i = statusQueries.length - 1; i >= 0; i--) {
      const url = statusQueries[i]?.data?.download_url;
      if (url) return url;
    }
    return null;
  }, [statusQueries]);

  async function retryFailed() {
    const filesToRetry = failedRows
      .map((row) => filesByName.get(row.filename))
      .filter((f): f is File => !!f);
    if (filesToRetry.length === 0) return;
    await submit(filesToRetry);
  }

  const hasStarted = batches.length > 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Layers3 className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Batch Compress</h1>
      <p className="mt-2 text-center text-white/55">
        Compress many PDFs at once - processed in the background, download everything as one ZIP.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        {!hasStarted && (
          <>
            <MergeDropzone onFilesAdded={addFiles} disabled={isSubmitting} />

            {pendingFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                  {pendingFiles.length} file{pendingFiles.length === 1 ? "" : "s"}
                </p>
                <ul className="mb-5 space-y-2">
                  {pendingFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="glass-card flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="truncate text-sm text-white/80">{file.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removePendingFile(index)}
                          className="text-white/40 hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Compression level</p>
                <CompressLevelPicker value={level} onChange={setLevel} disabled={isSubmitting} />

                {isSubmitting && (
                  <div className="mt-6">
                    <ProgressBar label="Uploading batch" isLabelHidden value={0} hasValueLabel={false} variant="accent" />
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <Button
                    label={isSubmitting ? "Submitting…" : `Compress ${pendingFiles.length} file${pendingFiles.length === 1 ? "" : "s"}`}
                    variant="primary"
                    isDisabled={isSubmitting}
                    onClick={handleInitialSubmit}
                  />
                </div>
              </motion.div>
            )}
          </>
        )}

        {hasStarted && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-white/55">
                {completedCount} of {rows.length} completed
                {failedRows.length > 0 && ` · ${failedRows.length} failed`}
              </p>
              {failedRows.length > 0 && overallDone && (
                <Button
                  label="Retry failed files"
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={retryFailed}
                />
              )}
            </div>

            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.filename}
                  className="glass-card flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="truncate text-sm text-white/80">{row.filename}</span>
                  <div className="flex items-center gap-4">
                    {row.status === "completed" && row.saved_size !== undefined && (
                      <span className="text-xs text-white/40">-{formatFileSize(row.saved_size)}</span>
                    )}
                    <JobStatus status={row.status} errorMessage={row.error} />
                  </div>
                </li>
              ))}
            </ul>

            {overallDone && latestDownloadUrl && (
              <BatchDownloadSection downloadUrl={latestDownloadUrl} />
            )}

            <div className="mt-6 flex justify-center">
              <Button label="Start a new batch" variant="ghost" onClick={startOver} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function BatchDownloadSection({ downloadUrl }: { downloadUrl: string }) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "batch_compressed.zip");

  return (
    <Card variant="default" padding={5} className="mt-6 w-full shadow-soft">
      <VStack gap={3}>
        <div className="flex items-center gap-2 text-success">
          <Check className="h-5 w-5" aria-hidden />
          <p className="font-medium">Your batch is ready</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="Download ZIP" variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleDownload} />
          <Button
            label="Open ZIP"
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
  );
}
