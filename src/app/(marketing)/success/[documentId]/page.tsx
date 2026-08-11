"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, FileEdit } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/VStack";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useDocument } from "@/hooks/useDocument";
import { useDownloadActions } from "@/hooks/useDownloadActions";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { resolveMediaUrl } from "@/lib/api";

export default function SuccessPage() {
  const params = useParams<{ documentId: string }>();
  const { document: doc, isLoading, isError, refetch } = useDocument(params.documentId);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" label="Loading document…" />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="flex h-[70vh] items-center justify-center px-4">
        <ErrorCard message="We couldn't load this document." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!doc.edited_file) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-black/55 dark:text-white/55">
          This document hasn&apos;t been saved yet.
        </p>
        <Button label="Go to editor" variant="primary" as={Link} href={`/editor/${doc.id}`} />
      </div>
    );
  }

  const downloadUrl = resolveMediaUrl(doc.edited_file);

  return <SuccessContent doc={doc} downloadUrl={downloadUrl} />;
}

function SuccessContent({
  doc,
  downloadUrl,
}: {
  doc: NonNullable<ReturnType<typeof useDocument>["document"]>;
  downloadUrl: string;
}) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, doc.original_name);

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

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black dark:text-white">
        Your PDF is ready
      </h1>
      <p className="mt-2 text-black/55 dark:text-white/55">
        {doc.original_name} has been regenerated with your edits.
      </p>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-700 dark:text-primary-400">
              <FileEdit className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-black dark:text-white">
                {doc.original_name}
              </p>
              <p className="text-xs text-black/40 dark:text-white/40">{doc.total_pages} pages</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
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
              href={downloadUrl}
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

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button label="Continue editing" variant="ghost" as={Link} href={`/editor/${doc.id}`} />
        <Button label="Upload another file" variant="ghost" as={Link} href="/upload" />
      </div>
    </div>
  );
}
