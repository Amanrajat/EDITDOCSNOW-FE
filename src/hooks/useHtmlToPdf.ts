"use client";

import { useMutation } from "@tanstack/react-query";
import { convertHtmlToPdf, type HtmlToPdfInput } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { ConversionResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

export function useHtmlToPdf() {
  const toast = useToast();

  const mutation = useMutation<ConversionResponseData, ApiError, HtmlToPdfInput>({
    mutationFn: (input) => convertHtmlToPdf(input),
    onError: (error) => {
      toast.error(error.message || "Converting to PDF failed. Please try again.");
    },
  });

  return {
    convert: (input: HtmlToPdfInput) => mutation.mutate(input),
    result: mutation.data,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
