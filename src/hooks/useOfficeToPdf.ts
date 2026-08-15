"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/toast/ToastProvider";
import type { ConversionResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

/** Generic hook for the three Office -> PDF conversions (Word/Excel/
 * PowerPoint) - they differ only in which converter function is passed. */
export function useOfficeToPdf(convertFn: (file: File, onProgress?: (percent: number) => void) => Promise<ConversionResponseData>) {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ConversionResponseData, ApiError, File>({
    mutationFn: (file) => {
      setProgress(0);
      return convertFn(file, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Converting the file failed. Please try again.");
    },
  });

  return {
    convert: (file: File) => mutation.mutate(file),
    result: mutation.data,
    progress,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
