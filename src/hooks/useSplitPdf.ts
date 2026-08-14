"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { splitPdf, type SplitParams } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { SplitResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface SplitInput {
  file: File;
  params: SplitParams;
}

export function useSplitPdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<SplitResponseData, ApiError, SplitInput>({
    mutationFn: ({ file, params }) => {
      setProgress(0);
      return splitPdf(file, params, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Split failed. Please try again.");
    },
  });

  return {
    split: (file: File, params: SplitParams) => mutation.mutate({ file, params }),
    result: mutation.data,
    progress,
    isSplitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
