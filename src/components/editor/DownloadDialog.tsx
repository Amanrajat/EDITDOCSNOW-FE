"use client";

import Link from "next/link";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/VStack";
import { useDownloadActions } from "@/hooks/useDownloadActions";

interface DownloadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  downloadUrl: string;
  filename?: string;
  documentId: string;
}

export function DownloadDialog({
  isOpen,
  onOpenChange,
  downloadUrl,
  filename,
  documentId,
}: DownloadDialogProps) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, filename);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={440} purpose="info">
      <Layout
        header={<DialogHeader title="Your PDF is ready" subtitle="Edits saved and regenerated" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={3}>
              <p className="text-sm text-white/60">
                {filename ?? "Your document"} has been regenerated with your changes. Download it,
                open it in a new tab, or copy the link to share.
              </p>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div className="flex w-full flex-wrap gap-2">
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
              <Button
                label="View summary"
                variant="ghost"
                as={Link}
                href={`/success/${documentId}`}
              />
            </div>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
