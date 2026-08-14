"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { removePages } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { RemovePagesResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface RemovePagesInput {
  file: File;
  pages: number[];
}

export function useRemovePages() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<RemovePagesResponseData, ApiError, RemovePagesInput>({
    mutationFn: ({ file, pages }) => {
      setProgress(0);
      return removePages(file, pages, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Removing pages failed. Please try again.");
    },
  });

  return {
    removePages: (file: File, pages: number[]) => mutation.mutate({ file, pages }),
    result: mutation.data,
    progress,
    isRemoving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
