"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertPdf, convertPdfToJpg } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { ConversionResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

/** Generic hook for any "just upload a PDF" conversion - pass the
 * endpoint path once and reuse across Word/Excel/PowerPoint/Markdown. */
export function useConvertPdf(endpointPath: string) {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ConversionResponseData, ApiError, File>({
    mutationFn: (file) => {
      setProgress(0);
      return convertPdf(file, endpointPath, setProgress);
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

interface JpgOptions {
  pages?: number[];
  dpi?: number;
  quality?: number;
}

export function useConvertPdfToJpg() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ConversionResponseData, ApiError, JpgOptions & { file: File }>({
    mutationFn: ({ file, ...options }) => {
      setProgress(0);
      return convertPdfToJpg(file, options, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Converting to JPG failed. Please try again.");
    },
  });

  return {
    convert: (file: File, options: JpgOptions) => mutation.mutate({ file, ...options }),
    result: mutation.data,
    progress,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
