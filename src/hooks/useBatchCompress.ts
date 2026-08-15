"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitBatchCompress } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { BatchSubmitResponseData, CompressLevel } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface SubmitInput {
  files: File[];
  level: CompressLevel;
}

/** Submits one batch of files for background compression. Returns the
 * batch_id/owner_token needed to poll useBatchStatus. */
export function useBatchCompress() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<BatchSubmitResponseData, ApiError, SubmitInput>({
    mutationFn: ({ files, level }) => {
      setProgress(0);
      return submitBatchCompress(files, level, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Submitting the batch failed. Please try again.");
    },
  });

  return {
    submitBatch: (files: File[], level: CompressLevel) => mutation.mutateAsync({ files, level }),
    progress,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
