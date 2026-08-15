"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertJpgToPdf, type JpgToPdfOptions } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { ConversionResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

export function useJpgToPdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ConversionResponseData, ApiError, { files: File[]; options: JpgToPdfOptions }>({
    mutationFn: ({ files, options }) => {
      setProgress(0);
      return convertJpgToPdf(files, options, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Creating the PDF failed. Please try again.");
    },
  });

  return {
    convert: (files: File[], options: JpgToPdfOptions) => mutation.mutate({ files, options }),
    result: mutation.data,
    progress,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
