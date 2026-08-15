"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocument } from "@/services/document.service";
import { useUIStore } from "@/store/ui.store";

export function useDocument(documentId: string | undefined) {
  const token = useUIStore((state) => (documentId ? state.getOwnerToken(documentId) : null));

  const query = useQuery({
    queryKey: ["document", documentId, token],
    queryFn: () => getDocument(documentId as string, token as string),
    enabled: Boolean(documentId) && Boolean(token),
  });

  return {
    document: query.data,
    isLoading: query.isLoading,
    isError: query.isError || (Boolean(documentId) && !token),
    error: query.error,
    refetch: query.refetch,
  };
}
