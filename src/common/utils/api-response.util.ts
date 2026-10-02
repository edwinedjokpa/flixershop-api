import {
  ApiErrorResponse,
  ApiOkResponse,
} from '../interfaces/api-response.interface.js';

interface CreateApiErrorResponseOptions {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

interface CreateApiOkResponseOptions<T> {
  message: string;
  data: T | null;
}

export function createApiOkResponse<T>({
  message,
  data,
}: CreateApiOkResponseOptions<T>): Omit<ApiOkResponse<T>, 'statusCode'> {
  return {
    success: true,
    message,
    data,
  };
}

export function createApiErrorResponse({
  statusCode,
  code,
  message,
  details,
}: CreateApiErrorResponseOptions): ApiErrorResponse {
  return {
    success: false as const,
    statusCode,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };
}
