"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cropPdf } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { CropRect, CropResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface CropInput {
  file: File;
  rect: CropRect;
  pages?: number[];
}

export function useCropPdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<CropResponseData, ApiError, CropInput>({
    mutationFn: ({ file, rect, pages }) => {
      setProgress(0);
      return cropPdf(file, rect, pages, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Cropping the PDF failed. Please try again.");
    },
  });

  return {
    crop: (file: File, rect: CropRect, pages?: number[]) => mutation.mutate({ file, rect, pages }),
    result: mutation.data,
    progress,
    isCropping: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
