"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocument } from "@/services/document.service";

export function useDocument(documentId: string | undefined) {
  const query = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => getDocument(documentId as string),
    enabled: Boolean(documentId),
  });

  return {
    document: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
