"use client";

import { useMutation } from "@tanstack/react-query";
import { extractBlocks } from "@/services/document.service";
import { useDocumentStore } from "@/store/document.store";
import { useToast } from "@/components/toast/ToastProvider";
import type { ExtractResponse } from "@/types/document";
import { ApiError } from "@/types/api";

export function useExtract() {
  const toast = useToast();
  const setBlocks = useDocumentStore((state) => state.setBlocks);

  const mutation = useMutation<ExtractResponse, ApiError, string>({
    mutationFn: (documentId: string) => extractBlocks(documentId),
    onSuccess: (result) => {
      setBlocks(result.blocks);
      if (result.total_blocks === 0) {
        toast.info("No editable text blocks were found in this document.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to extract text blocks.");
    },
  });

  return {
    extract: mutation.mutate,
    extractAsync: mutation.mutateAsync,
    isExtracting: mutation.isPending,
    error: mutation.error,
  };
}
