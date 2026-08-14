import { pdfApi } from "@/lib/api";
import type {
  ApiEnvelope,
  MergeResponseData,
  OrganizeResponseData,
  RemovePagesResponseData,
  SplitMode,
  SplitResponseData,
} from "@/types/pdf";

export async function mergePdfs(
  files: File[],
  order?: number[],
  onProgress?: (percent: number) => void,
): Promise<MergeResponseData> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  order?.forEach((index) => formData.append("order", String(index)));

  const { data } = await pdfApi.post<ApiEnvelope<MergeResponseData>>(
    "/merge/",
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export interface SplitParams {
  mode: SplitMode;
  ranges?: string;
  n?: number;
  pages?: number[];
}

export async function splitPdf(
  file: File,
  params: SplitParams,
  onProgress?: (percent: number) => void,
): Promise<SplitResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", params.mode);
  if (params.ranges) formData.append("ranges", params.ranges);
  if (params.n) formData.append("n", String(params.n));
  params.pages?.forEach((page) => formData.append("pages", String(page)));

  const { data } = await pdfApi.post<ApiEnvelope<SplitResponseData>>(
    "/split/",
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export async function organizePdf(
  file: File,
  order: number[],
  onProgress?: (percent: number) => void,
): Promise<OrganizeResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  order.forEach((pageNumber) => formData.append("order", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<OrganizeResponseData>>(
    "/organize/",
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export async function removePages(
  file: File,
  pages: number[],
  onProgress?: (percent: number) => void,
): Promise<RemovePagesResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  pages.forEach((pageNumber) => formData.append("pages", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<RemovePagesResponseData>>(
    "/remove-pages/",
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export const pdfService = { mergePdfs, splitPdf, organizePdf, removePages };
