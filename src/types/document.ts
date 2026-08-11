export type DocumentStatus = "uploaded" | "extracted" | "saved" | "failed";

export interface DocumentBlock {
  id: string;
  page_number: number;
  text: string;
  bbox: [number, number, number, number];
  font_name: string;
  font_size: number;
  color: string;
  is_bold: boolean;
  is_italic: boolean;
  has_link: boolean;
}

export interface DocumentEntity {
  id: string;
  original_file: string;
  edited_file: string | null;
  original_name: string;
  file_type: string;
  file_size: number;
  total_pages: number;
  status: DocumentStatus;
  error_message: string;
  blocks: DocumentBlock[];
}

export type UploadResponse = DocumentEntity;

export interface ExtractResponse {
  document_id: string;
  total_blocks: number;
  blocks: DocumentBlock[];
}

export interface SaveBlockInput {
  id: string;
  text: string;
}

export interface SaveRequest {
  blocks: SaveBlockInput[];
}

export interface SaveResponse {
  document_id: string;
  download_url: string;
}
