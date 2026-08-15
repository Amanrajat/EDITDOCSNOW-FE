"use client";

import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { OfficeFileDropzone } from "@/components/convert/OfficeFileDropzone";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useOfficeToPdf } from "@/hooks/useOfficeToPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import type { ConversionResponseData } from "@/types/pdf";

interface OfficeToPdfPageProps {
  icon: ReactNode;
  title: string;
  description: string;
  kind: "docx" | "xlsx" | "pptx";
  fileTypeLabel: string;
  convertFn: (file: File, onProgress?: (percent: number) => void) => Promise<ConversionResponseData>;
  resultHeading: string;
}

/** Shared page shell for the three Office -> PDF conversions (Word/
 * Excel/PowerPoint) - identical except copy, accepted file kind, and
 * which converter function they call. Mirrors ConversionToolPage's role
 * for the PDF-to-X conversions. */
export function OfficeToPdfPage({
  icon,
  title,
  description,
  kind,
  fileTypeLabel,
  convertFn,
  resultHeading,
}: OfficeToPdfPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const { convert, result, progress, isConverting, isSuccess, error, reset } = useOfficeToPdf(convertFn);

  function startOver() {
    setFile(null);
    reset();
  }

  if (isSuccess && result) {
    return (
      <OfficeToPdfSuccess
        downloadUrl={result.download_url}
        pageCount={Number(result.page_count ?? 0)}
        heading={resultHeading}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">{icon}</span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-center text-white/55">{description}</p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <OfficeFileDropzone
          kind={kind}
          label={fileTypeLabel}
          onFileSelected={setFile}
          isUploading={false}
          progress={0}
          selectedFile={file}
        />

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
            {isConverting && (
              <div className="mb-6">
                <ProgressBar label="Converting" isLabelHidden value={progress} hasValueLabel variant="accent" />
              </div>
            )}
            <div className="flex justify-center">
              <Button
                label={isConverting ? "Converting…" : "Convert to PDF"}
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

function OfficeToPdfSuccess({
  downloadUrl,
  pageCount,
  heading,
  onStartOver,
}: {
  downloadUrl: string;
  pageCount: number;
  heading: string;
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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">{heading}</h1>
      {pageCount > 0 && <p className="mt-2 text-white/55">{pageCount} page{pageCount === 1 ? "" : "s"} generated.</p>}

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

      <Button label="Convert another file" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
