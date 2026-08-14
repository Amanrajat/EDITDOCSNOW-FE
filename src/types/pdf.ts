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
