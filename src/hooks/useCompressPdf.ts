"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { compressPdf } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { CompressLevel, CompressResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface CompressInput {
  file: File;
  level: CompressLevel;
}

export function useCompressPdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<CompressResponseData, ApiError, CompressInput>({
    mutationFn: ({ file, level }) => {
      setProgress(0);
      return compressPdf(file, level, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Compressing the PDF failed. Please try again.");
    },
  });

  return {
    compress: (file: File, level: CompressLevel) => mutation.mutate({ file, level }),
    result: mutation.data,
    progress,
    isCompressing: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
