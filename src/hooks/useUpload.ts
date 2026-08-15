"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { uploadPDF, validatePdfFile } from "@/services/document.service";
import { useDocumentStore } from "@/store/document.store";
import { useUIStore } from "@/store/ui.store";
import { useToast } from "@/components/toast/ToastProvider";
import type { UploadResponse } from "@/types/document";
import { ApiError } from "@/types/api";

export function useUpload() {
  const router = useRouter();
  const toast = useToast();
  const setDocument = useDocumentStore((state) => state.setDocument);
  const addRecentDocument = useUIStore((state) => state.addRecentDocument);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<UploadResponse, ApiError, File>({
    mutationFn: (file: File) => {
      setProgress(0);
      return uploadPDF(file, setProgress);
    },
    onSuccess: (document) => {
      setDocument(document);
      addRecentDocument({
        id: document.id,
        name: document.original_name,
        uploadedAt: Date.now(),
        totalPages: document.total_pages,
        ownerToken: document.owner_token,
      });

      if (document.status === "failed") {
        toast.error(document.error_message || "Upload failed to process.");
        return;
      }

      toast.success(`${document.original_name} uploaded successfully.`);
      router.push(`/editor/${document.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed. Please try again.");
    },
  });

  function upload(file: File) {
    const validationError = validatePdfFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    mutation.mutate(file);
  }

  return {
    upload,
    progress,
    isUploading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
