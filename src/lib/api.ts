import axios, { AxiosError, type AxiosInstance } from "axios";
import { ApiError } from "@/types/api";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/docs_editor";

export const API_ORIGIN = new URL(API_BASE).origin;

/** Resolve a backend-relative media path (e.g. "/media/...") to an absolute URL. */
export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function attachInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<Record<string, unknown>>) => {
      if (error.response) {
        const data = error.response.data;
        const message = extractErrorMessage(data) ?? error.message;
        return Promise.reject(
          new ApiError(message, error.response.status, data),
        );
      }
      if (error.request) {
        return Promise.reject(
          new ApiError(
            "Could not reach the server. Check your connection and that the backend is running.",
            undefined,
            error.message,
          ),
        );
      }
      return Promise.reject(new ApiError(error.message));
    },
  );

  return instance;
}

/** docs_editor endpoints (upload/extract/save the text-block editor). */
export const api = attachInterceptors(
  axios.create({ baseURL: API_BASE, timeout: 60_000 }),
);

/**
 * Newer /api/v1/pdf/... endpoints (merge, split, ...) live under a
 * different prefix than the docs_editor-scoped `api` instance above, so
 * they need their own baseURL off the shared origin rather than reusing
 * `API_BASE` (which already has `/docs_editor` baked in).
 */
export const pdfApi = attachInterceptors(
  axios.create({ baseURL: `${API_ORIGIN}/api/v1/pdf`, timeout: 120_000 }),
);

function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;

  if (typeof record.error_message === "string" && record.error_message) {
    return record.error_message;
  }

  // {success:false, message, error_code, errors: {field: [msg, ...]}} -
  // the /api/v1/pdf/... envelope. Prefer the first field-level message
  // when present, since it's usually more actionable than the generic
  // top-level "message" (e.g. "Invalid request.").
  if (record.success === false && record.errors && typeof record.errors === "object") {
    const errors = record.errors as Record<string, unknown>;
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      const fieldErrors = errors[firstField];
      const firstMessage = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
      if (typeof firstMessage === "string") return firstMessage;
    }
  }

  if (typeof record.detail === "string") return record.detail;
  if (typeof record.message === "string") return record.message;

  const firstKey = Object.keys(record)[0];
  if (firstKey) {
    const value = record[firstKey];
    if (Array.isArray(value) && typeof value[0] === "string") {
      return `${firstKey}: ${value[0]}`;
    }
    if (typeof value === "string") return value;
  }
  return undefined;
}
