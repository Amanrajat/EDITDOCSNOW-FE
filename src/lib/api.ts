import axios, { AxiosError } from "axios";
import { ApiError } from "@/types/api";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/docs_editor";

const API_ORIGIN = new URL(API_BASE).origin;

/** Resolve a backend-relative media path (e.g. "/media/...") to an absolute URL. */
export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
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

function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;

  if (typeof record.error_message === "string" && record.error_message) {
    return record.error_message;
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
