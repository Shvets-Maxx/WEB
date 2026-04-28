import type { NextApiResponse } from 'next';
import type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  PaginationMeta,
} from '@/types';

export function sendSuccess<T>(
  res: NextApiResponse<ApiResponse<T>>,
  data: T,
  meta?: PaginationMeta,
  status = 200,
): void {
  const body: ApiSuccess<T> = meta ? { ok: true, data, meta } : { ok: true, data };
  res.status(status).json(body);
}

export function sendError(
  res: NextApiResponse<ApiResponse<never>>,
  error: ApiError,
  status?: number,
): void {
  const code = status ?? statusForCode(error.code);
  res.status(code).json({ ok: false, error });
}

function statusForCode(code: ApiError['code']): number {
  switch (code) {
    case 'BAD_REQUEST':
    case 'VALIDATION_ERROR':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'METHOD_NOT_ALLOWED':
      return 405;
    case 'INTERNAL_ERROR':
      return 500;
  }
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { slice: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, meta: { page, pageSize, total, totalPages } };
}
