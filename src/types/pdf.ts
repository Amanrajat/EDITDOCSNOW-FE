/** Shape returned by every /api/v1/pdf/... endpoint. */
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  error_code: string;
  errors?: Record<string, string[] | string>;
}

export interface MergeResponseData {
  file_id: string;
  /**
   * Bearer token for this job, embedded as a query param in download_url
   * already - present here too in case a future feature needs to make its
   * own authenticated request for this job (e.g. a status check).
   */
  owner_token: string;
  download_url: string;
  filename: string;
  source_count: number;
  total_pages: number;
}

export type SplitMode = "all_pages" | "ranges" | "every_n" | "extract";

export interface SplitResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  is_zip: boolean;
  output_count: number;
  output_filenames: string[];
  source_pages: number;
}

export interface OrganizeResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  page_count: number;
}

export interface RemovePagesResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  source_page_count: number;
  removed_pages: number[];
  output_page_count: number;
}

export interface RotateResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  page_count: number;
  rotated_pages: number[];
  degrees: number;
}

/** Fractional crop rect (0..1), top-left origin, y increasing downward -
 * matches PyMuPDF's page.rect convention and a browser canvas/image. */
export interface CropRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface CropResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  page_count: number;
  cropped_pages: number[];
  crop_rect: CropRect;
}

export type PageNumberPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface PageNumberOptions {
  startNumber: number;
  position: PageNumberPosition;
  fontSize: number;
  fontColor: string;
  margin: number;
  prefix: string;
  suffix: string;
}

export interface PageNumberResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  page_count: number;
  numbered_pages: number[];
  start_number: number;
  position: PageNumberPosition;
}

export type CompressLevel = "high_quality" | "recommended" | "high_compression" | "maximum_compression";

export interface CompressResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  page_count: number;
  level: CompressLevel;
  original_size: number;
  compressed_size: number;
  saved_size: number;
  reduction_percent: number;
}

export type BatchFileStatus = "queued" | "processing" | "completed" | "failed";

export interface BatchFileEntry {
  id: string;
  order: number;
  filename: string;
  status: BatchFileStatus;
  error?: string;
  page_count?: number;
  original_size?: number;
  compressed_size?: number;
  saved_size?: number;
}

export interface BatchSubmitResponseData {
  batch_id: string;
  owner_token: string;
  status_url: string;
  total_files: number;
  status: string;
  files: BatchFileEntry[];
}

export interface BatchStatusResponseData {
  batch_id: string;
  status: "queued" | "processing" | "completed" | "partial" | "failed";
  total_files: number;
  completed_count: number;
  failed_count: number;
  download_url: string | null;
  files: BatchFileEntry[];
}

export type ConversionOperation =
  | "pdf_to_word"
  | "pdf_to_excel"
  | "pdf_to_pptx"
  | "pdf_to_jpg"
  | "pdf_to_pdfa"
  | "pdf_to_markdown"
  | "word_to_pdf"
  | "excel_to_pdf"
  | "pptx_to_pdf"
  | "jpg_to_pdf"
  | "html_to_pdf";

/** Every conversion endpoint returns this shape plus operation-specific
 * extra fields (page_count, table_count, image_count, scanned_pages,
 * converted_pages, dpi, quality, ...) spread alongside it. */
export interface ConversionResponseData {
  file_id: string;
  owner_token: string;
  download_url: string;
  filename: string;
  operation: ConversionOperation;
  [key: string]: unknown;
}

export type OcrLanguage = "eng" | "fra" | "deu" | "spa" | "hin";

export interface OcrSubmitResponseData {
  job_id: string;
  owner_token: string;
  status_url: string;
  status: string;
  language: string;
}

export interface OcrStatusResponseData {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  language: string;
  page_count: number;
  ocr_page_count: number;
  error: string | null;
  download_url: string | null;
}
