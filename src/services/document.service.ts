import { api } from "@/lib/api";
import type {
  DocumentEntity,
  ExtractResponse,
  SaveBlockInput,
  SaveResponse,
  UploadResponse,
} from "@/types/document";

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are supported.";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return "File exceeds the 20MB size limit.";
  return null;
}

export async function uploadPDF(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("original_file", file);

  const { data } = await api.post<UploadResponse>("/upload/", formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function extractBlocks(documentId: string): Promise<ExtractResponse> {
  const { data } = await api.post<ExtractResponse>(`/${documentId}/extract/`);
  return data;
}

export async function getDocument(documentId: string): Promise<DocumentEntity> {
  const { data } = await api.get<DocumentEntity>(`/${documentId}/`);
  return data;
}

export async function saveBlocks(
  documentId: string,
  blocks: SaveBlockInput[],
): Promise<SaveResponse> {
  const { data } = await api.post<SaveResponse>(`/${documentId}/save/`, { blocks });
  return data;
}

export const documentService = {
  uploadPDF,
  extractBlocks,
  getDocument,
  saveBlocks,
  validatePdfFile,
};
