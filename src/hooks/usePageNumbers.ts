"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addPageNumbers } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { PageNumberOptions, PageNumberResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface PageNumberInput {
  file: File;
  options: PageNumberOptions;
  pages?: number[];
}

export function usePageNumbers() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<PageNumberResponseData, ApiError, PageNumberInput>({
    mutationFn: ({ file, options, pages }) => {
      setProgress(0);
      return addPageNumbers(file, options, pages, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Adding page numbers failed. Please try again.");
    },
  });

  return {
    addPageNumbers: (file: File, options: PageNumberOptions, pages?: number[]) =>
      mutation.mutate({ file, options, pages }),
    result: mutation.data,
    progress,
    isAdding: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
