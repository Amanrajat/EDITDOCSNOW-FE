"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitOcr } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { OcrSubmitResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

export function useSubmitOcr() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<OcrSubmitResponseData, ApiError, { file: File; language: string }>({
    mutationFn: ({ file, language }) => {
      setProgress(0);
      return submitOcr(file, language, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Submitting the OCR job failed. Please try again.");
    },
  });

  return {
    submit: (file: File, language: string) => mutation.mutateAsync({ file, language }),
    progress,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
