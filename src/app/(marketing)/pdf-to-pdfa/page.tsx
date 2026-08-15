"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, Check, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { usePdfToPdfA, type PdfALevel } from "@/hooks/usePdfToPdfA";
import { useDownloadActions } from "@/hooks/useDownloadActions";

export default function PdfToPdfAPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<PdfALevel>("2b");
  const { convert, result, progress, isConverting, isSuccess, error, reset } = usePdfToPdfA();

  function startOver() {
    setFile(null);
    reset();
  }

  if (isSuccess && result) {
    return (
      <PdfASuccess
        downloadUrl={result.download_url}
        standard={String(result.pdfa_standard ?? `PDF/A-${level.toUpperCase()}`)}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Archive className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">PDF to PDF/A</h1>
      <p className="mt-2 text-center text-white/55">
        Convert your PDF to the PDF/A archival standard for long-term preservation.
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
            <SegmentedControl label="PDF/A standard" value={level} onChange={(v) => setLevel(v as PdfALevel)}>
              <SegmentedControlItem value="1b" label="PDF/A-1b" />
              <SegmentedControlItem value="2b" label="PDF/A-2b" />
              <SegmentedControlItem value="3b" label="PDF/A-3b" />
            </SegmentedControl>
            <p className="mt-2 text-xs text-white/35">
              &quot;b&quot; (basic) conformance - visual reproducibility. Higher numbers support newer PDF features
              (transparency, JPEG2000, attachments).
            </p>

            {isConverting && (
              <div className="mt-6">
                <ProgressBar label="Converting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                label={isConverting ? "Converting…" : "Convert to PDF/A"}
                variant="primary"
                isDisabled={isConverting}
                onClick={() => convert(file, level)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PdfASuccess({
  downloadUrl,
  standard,
  onStartOver,
}: {
  downloadUrl: string;
  standard: string;
  onStartOver: () => void;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "converted.pdf");

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is now {standard}</h1>
      <p className="mt-2 text-white/55">Converted using Ghostscript&apos;s PDF/A device.</p>

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

      <Button label="Convert another PDF" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
