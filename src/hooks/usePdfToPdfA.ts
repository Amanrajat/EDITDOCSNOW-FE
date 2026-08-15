"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertPdfToPdfA } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { ConversionResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

export type PdfALevel = "1b" | "2b" | "3b";

export function usePdfToPdfA() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ConversionResponseData, ApiError, { file: File; level: PdfALevel }>({
    mutationFn: ({ file, level }) => {
      setProgress(0);
      return convertPdfToPdfA(file, level, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Converting to PDF/A failed. Please try again.");
    },
  });

  return {
    convert: (file: File, level: PdfALevel) => mutation.mutate({ file, level }),
    result: mutation.data,
    progress,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
