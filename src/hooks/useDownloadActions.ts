"use client";

import { useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { copyToClipboard, triggerDownload } from "@/utils/download";

/**
 * Download/copy-link actions shared by DownloadDialog and the success page —
 * previously duplicated in both places.
 */
export function useDownloadActions(downloadUrl: string, filename?: string) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    triggerDownload(downloadUrl, filename);
  }

  async function handleCopy() {
    const success = await copyToClipboard(downloadUrl);
    setCopied(success);
    if (success) {
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy the link.");
    }
  }

  return { copied, handleDownload, handleCopy };
}
