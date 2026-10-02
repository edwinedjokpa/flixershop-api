export interface ApiOkResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T | null;
}

export interface ApiError<TDetails = unknown> {
  code: string;
  message: string;
  details?: TDetails;
}

export interface ApiErrorResponse<TDetails = unknown> {
  success: false;
  statusCode: number;
  error: ApiError<TDetails>;
}

export interface ApiValidationErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: 'VALIDATION_FAILED';
    message: string;
  };
  errors: Record<string, string[]>;
}

export type ApiResult<T, TDetails = unknown> =
  ApiOkResponse<T> | ApiErrorResponse<TDetails> | ApiValidationErrorResponse;
