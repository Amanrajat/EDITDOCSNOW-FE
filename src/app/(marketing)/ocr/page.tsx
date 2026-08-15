"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, ScanText } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { JobStatus } from "@/components/processing/JobStatus";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useSubmitOcr } from "@/hooks/useOcr";
import { useOcrStatus } from "@/hooks/useOcrStatus";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import type { OcrLanguage } from "@/types/pdf";

const LANGUAGES: { value: OcrLanguage; label: string }[] = [
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "spa", label: "Spanish" },
  { value: "hin", label: "Hindi" },
];

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>("eng");
  const [job, setJob] = useState<{ id: string; token: string } | null>(null);

  const { submit, isSubmitting, error, reset } = useSubmitOcr();
  const { data: status } = useOcrStatus(job?.id ?? null, job?.token ?? null);

  function startOver() {
    setFile(null);
    setJob(null);
    reset();
  }

  async function handleSubmit() {
    if (!file) return;
    const result = await submit(file, language);
    setJob({ id: result.job_id, token: result.owner_token });
  }

  if (job && status?.status === "completed" && status.download_url) {
    return (
      <OcrSuccess
        downloadUrl={status.download_url}
        pageCount={status.page_count}
        ocrPageCount={status.ocr_page_count}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <ScanText className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">OCR - Make Scanned PDFs Searchable</h1>
      <p className="mt-2 text-center text-white/55">
        Recognizes text in scanned or image-only pages so they become selectable and searchable.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        {!job && (
          <>
            <UploadDropzone onFileSelected={setFile} isUploading={false} progress={0} selectedFile={file} />

            {file && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
                <SegmentedControl label="Document language" value={language} onChange={(v) => setLanguage(v as OcrLanguage)}>
                  {LANGUAGES.map((lang) => (
                    <SegmentedControlItem key={lang.value} value={lang.value} label={lang.label} />
                  ))}
                </SegmentedControl>

                <div className="mt-6 flex justify-center">
                  <Button
                    label={isSubmitting ? "Submitting…" : "Run OCR"}
                    variant="primary"
                    isDisabled={isSubmitting}
                    onClick={handleSubmit}
                  />
                </div>
              </motion.div>
            )}
          </>
        )}

        {job && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="glass-card flex flex-col items-center gap-4 rounded-xl border border-border p-8 text-center">
              <JobStatus
                status={status?.status === "failed" ? "failed" : status?.status === "completed" ? "completed" : "processing"}
                errorMessage={status?.error ?? undefined}
              />
              <p className="text-sm text-white/55">
                {status?.status === "failed"
                  ? "OCR failed - see the message above."
                  : "Recognizing text - this can take a little while for multi-page scans…"}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button label="Start a new OCR job" variant="ghost" onClick={startOver} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OcrSuccess({
  downloadUrl,
  pageCount,
  ocrPageCount,
  onStartOver,
}: {
  downloadUrl: string;
  pageCount: number;
  ocrPageCount: number;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "searchable.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is now searchable</h1>
      <p className="mt-2 text-white/55">
        {ocrPageCount} of {pageCount} page{pageCount === 1 ? "" : "s"} recognized via OCR
        {ocrPageCount < pageCount ? " (the rest already had real text)." : "."}
      </p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex flex-wrap justify-center gap-2">
            <Button label="Download" variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleDownload} />
            <Button
              label="Open"
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

      <Button label="OCR another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
