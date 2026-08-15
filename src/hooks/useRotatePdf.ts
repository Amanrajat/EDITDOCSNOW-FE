"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { applyPageRotations } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { RotateResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface RotateInput {
  file: File;
  rotationsByPage: Record<number, number>;
}

export function useRotatePdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<RotateResponseData, ApiError, RotateInput>({
    mutationFn: ({ file, rotationsByPage }) => {
      setProgress(0);
      return applyPageRotations(file, rotationsByPage, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Rotating the PDF failed. Please try again.");
    },
  });

  return {
    applyRotations: (file: File, rotationsByPage: Record<number, number>) =>
      mutation.mutate({ file, rotationsByPage }),
    result: mutation.data,
    progress,
    isRotating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
