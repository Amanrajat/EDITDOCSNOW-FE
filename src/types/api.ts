export interface ApiErrorShape {
  message: string;
  status?: number;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
