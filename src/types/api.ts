export type SortDirection = 'asc' | 'desc';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'METHOD_NOT_ALLOWED';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string>;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  ok: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
