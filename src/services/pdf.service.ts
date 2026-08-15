import { pdfApi } from "@/lib/api";
import type {
  ApiEnvelope,
  BatchStatusResponseData,
  BatchSubmitResponseData,
  CompressLevel,
  CompressResponseData,
  ConversionResponseData,
  CropRect,
  CropResponseData,
  MergeResponseData,
  OcrStatusResponseData,
  OcrSubmitResponseData,
  OrganizeResponseData,
  PageNumberOptions,
  PageNumberResponseData,
  RemovePagesResponseData,
  RotateResponseData,
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

export async function rotatePdf(
  file: File,
  degrees: number,
  pages?: number[],
  onProgress?: (percent: number) => void,
): Promise<RotateResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("degrees", String(degrees));
  pages?.forEach((pageNumber) => formData.append("pages", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<RotateResponseData>>(
    "/rotate/",
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

/**
 * The backend applies ONE rotation amount to a set of pages per request -
 * it has no concept of "page 2 rotates 90, page 5 rotates 180" in a single
 * call. To let the UI support exactly that (select some pages, rotate
 * them, select others, rotate differently, then apply everything at once),
 * this groups the requested per-page rotation deltas by identical value
 * and chains one API call per group, feeding each call's output PDF into
 * the next as the input file. Pages with a 0 delta (no change) are
 * skipped entirely.
 */
export async function applyPageRotations(
  file: File,
  rotationsByPage: Record<number, number>,
  onProgress?: (percent: number) => void,
): Promise<RotateResponseData> {
  const groups = new Map<number, number[]>();
  for (const [pageStr, degrees] of Object.entries(rotationsByPage)) {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized === 0) continue;
    const pageNumber = Number(pageStr);
    const list = groups.get(normalized) ?? [];
    list.push(pageNumber);
    groups.set(normalized, list);
  }

  if (groups.size === 0) {
    throw new Error("No pages have a pending rotation to apply.");
  }

  let currentFile = file;
  let lastResult: RotateResponseData | null = null;
  const entries = Array.from(groups.entries());

  for (const [index, [degrees, pages]] of entries.entries()) {
    lastResult = await rotatePdf(currentFile, degrees, pages, onProgress);

    if (index < entries.length - 1) {
      const response = await fetch(lastResult.download_url);
      const blob = await response.blob();
      currentFile = new File([blob], "rotated-intermediate.pdf", { type: "application/pdf" });
    }
  }

  if (!lastResult) {
    throw new Error("No pages have a pending rotation to apply.");
  }

  return lastResult;
}

export async function cropPdf(
  file: File,
  rect: CropRect,
  pages?: number[],
  onProgress?: (percent: number) => void,
): Promise<CropResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("x0", String(rect.x0));
  formData.append("y0", String(rect.y0));
  formData.append("x1", String(rect.x1));
  formData.append("y1", String(rect.y1));
  pages?.forEach((pageNumber) => formData.append("pages", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<CropResponseData>>(
    "/crop/",
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

export async function addPageNumbers(
  file: File,
  options: PageNumberOptions,
  pages?: number[],
  onProgress?: (percent: number) => void,
): Promise<PageNumberResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("start_number", String(options.startNumber));
  formData.append("position", options.position);
  formData.append("font_size", String(options.fontSize));
  formData.append("font_color", options.fontColor);
  formData.append("margin", String(options.margin));
  formData.append("prefix", options.prefix);
  formData.append("suffix", options.suffix);
  pages?.forEach((pageNumber) => formData.append("pages", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<PageNumberResponseData>>(
    "/page-numbers/",
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

export async function compressPdf(
  file: File,
  level: CompressLevel,
  onProgress?: (percent: number) => void,
): Promise<CompressResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);

  const { data } = await pdfApi.post<ApiEnvelope<CompressResponseData>>(
    "/compress/",
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

export async function submitBatchCompress(
  files: File[],
  level: CompressLevel,
  onProgress?: (percent: number) => void,
): Promise<BatchSubmitResponseData> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("level", level);

  const { data } = await pdfApi.post<ApiEnvelope<BatchSubmitResponseData>>(
    "/batch/compress/",
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

export async function getBatchStatus(batchId: string, token: string): Promise<BatchStatusResponseData> {
  const { data } = await pdfApi.get<ApiEnvelope<BatchStatusResponseData>>(
    `/batch/${batchId}/status/`,
    { params: { token } },
  );
  return data.data;
}

/** Generic caller for every "just upload a PDF" conversion (Word, Excel,
 * PowerPoint, Markdown) - they differ only in which endpoint they hit. */
export async function convertPdf(
  file: File,
  endpointPath: string,
  onProgress?: (percent: number) => void,
): Promise<ConversionResponseData> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>(
    endpointPath,
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

export async function convertPdfToJpg(
  file: File,
  options: { pages?: number[]; dpi?: number; quality?: number },
  onProgress?: (percent: number) => void,
): Promise<ConversionResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.dpi !== undefined) formData.append("dpi", String(options.dpi));
  if (options.quality !== undefined) formData.append("quality", String(options.quality));
  options.pages?.forEach((pageNumber) => formData.append("pages", String(pageNumber)));

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>(
    "/convert/pdf-to-jpg/",
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

export interface JpgToPdfOptions {
  order?: number[];
  pageSize?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  fitMode?: "fit" | "fill";
  margin?: number;
  quality?: number;
}

export async function convertJpgToPdf(
  files: File[],
  options: JpgToPdfOptions,
  onProgress?: (percent: number) => void,
): Promise<ConversionResponseData> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  options.order?.forEach((index) => formData.append("order", String(index)));
  if (options.pageSize) formData.append("page_size", options.pageSize);
  if (options.orientation) formData.append("orientation", options.orientation);
  if (options.fitMode) formData.append("fit_mode", options.fitMode);
  if (options.margin !== undefined) formData.append("margin", String(options.margin));
  if (options.quality !== undefined) formData.append("quality", String(options.quality));

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>(
    "/convert/jpg-to-pdf/",
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

export async function convertPdfToPdfA(
  file: File,
  level: "1b" | "2b" | "3b",
  onProgress?: (percent: number) => void,
): Promise<ConversionResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>(
    "/convert/pdf-to-pdfa/",
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

async function convertOfficeToPdf(
  file: File,
  endpointPath: string,
  onProgress?: (percent: number) => void,
): Promise<ConversionResponseData> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>(
    endpointPath,
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

export const convertWordToPdf = (file: File, onProgress?: (percent: number) => void) =>
  convertOfficeToPdf(file, "/convert/word-to-pdf/", onProgress);
export const convertExcelToPdf = (file: File, onProgress?: (percent: number) => void) =>
  convertOfficeToPdf(file, "/convert/excel-to-pdf/", onProgress);
export const convertPptxToPdf = (file: File, onProgress?: (percent: number) => void) =>
  convertOfficeToPdf(file, "/convert/pptx-to-pdf/", onProgress);

export interface HtmlToPdfInput {
  url?: string;
  html?: string;
  pageSize?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
}

export async function convertHtmlToPdf(input: HtmlToPdfInput): Promise<ConversionResponseData> {
  const formData = new FormData();
  if (input.url) formData.append("url", input.url);
  if (input.html) formData.append("html", input.html);
  if (input.pageSize) formData.append("page_size", input.pageSize);
  if (input.orientation) formData.append("orientation", input.orientation);

  const { data } = await pdfApi.post<ApiEnvelope<ConversionResponseData>>("/convert/html-to-pdf/", formData);
  return data.data;
}

export async function submitOcr(
  file: File,
  language: string,
  onProgress?: (percent: number) => void,
): Promise<OcrSubmitResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const { data } = await pdfApi.post<ApiEnvelope<OcrSubmitResponseData>>(
    "/ocr/",
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

export async function getOcrStatus(jobId: string, token: string): Promise<OcrStatusResponseData> {
  const { data } = await pdfApi.get<ApiEnvelope<OcrStatusResponseData>>(
    `/ocr/${jobId}/status/`,
    { params: { token } },
  );
  return data.data;
}

export const pdfService = {
  mergePdfs,
  splitPdf,
  organizePdf,
  removePages,
  rotatePdf,
  applyPageRotations,
  cropPdf,
  addPageNumbers,
  compressPdf,
  submitBatchCompress,
  getBatchStatus,
  convertPdf,
  convertPdfToJpg,
  convertJpgToPdf,
  convertPdfToPdfA,
  convertWordToPdf,
  convertExcelToPdf,
  convertPptxToPdf,
  convertHtmlToPdf,
  submitOcr,
  getOcrStatus,
};
