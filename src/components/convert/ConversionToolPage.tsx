"use client";

import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useConvertPdf } from "@/hooks/useConvertPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import type { ConversionResponseData } from "@/types/pdf";

interface ConversionToolPageProps {
  icon: ReactNode;
  title: string;
  description: string;
  endpointPath: string;
  resultHeading: string;
  resultDescription?: (result: ConversionResponseData) => string;
  resultFilename: string;
  renderStats?: (result: ConversionResponseData) => ReactNode;
  submitLabel?: string;
}

/**
 * Shared page shell for every "upload a PDF, get a converted file back"
 * tool (Word/Excel/PowerPoint/Markdown) - they're identical except for
 * copy, endpoint, and what extra stats (if any) the success screen shows.
 * Richer conversions with real options (PDF-to-JPG's page/DPI/quality
 * picker) don't use this - they need their own page.
 */
export function ConversionToolPage({
  icon,
  title,
  description,
  endpointPath,
  resultHeading,
  resultDescription,
  resultFilename,
  renderStats,
  submitLabel = "Convert",
}: ConversionToolPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const { convert, result, progress, isConverting, isSuccess, error, reset } = useConvertPdf(endpointPath);

  function startOver() {
    setFile(null);
    reset();
  }

  if (isSuccess && result) {
    return (
      <ConversionSuccess
        result={result}
        heading={resultHeading}
        description={resultDescription?.(result)}
        filename={resultFilename}
        renderStats={renderStats}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        {icon}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-center text-white/55">{description}</p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <UploadDropzone onFileSelected={setFile} isUploading={false} progress={0} selectedFile={file} />

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
            {isConverting && (
              <div className="mb-6">
                <ProgressBar label="Converting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}
            <div className="flex justify-center">
              <Button
                label={isConverting ? "Converting…" : submitLabel}
                variant="primary"
                isDisabled={isConverting}
                onClick={() => convert(file)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ConversionSuccess({
  result,
  heading,
  description,
  filename,
  renderStats,
  onStartOver,
}: {
  result: ConversionResponseData;
  heading: string;
  description?: string;
  filename: string;
  renderStats?: (result: ConversionResponseData) => ReactNode;
  onStartOver: () => void;
}) {
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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">{heading}</h1>
      {description && <p className="mt-2 text-white/55">{description}</p>}

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={4}>
          {renderStats?.(result)}
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

      <Button label="Convert another file" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
