export type ApiErrorResponse = {
  code: string;
  message: string;
  correlationId?: string;
  details?: Record<string, unknown>;
};

export class ApiError extends Error {
  code: string;
  status: number;
  correlationId?: string;
  details?: Record<string, unknown>;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.status = status;
    this.code = response.code;
    this.correlationId = response.correlationId;
    this.details = response.details;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}
