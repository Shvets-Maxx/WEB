import type { ApiError } from '@/types';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };

export function parsePositiveInt(
  raw: string | string[] | undefined,
  fallback: number,
  field: string,
  max = 1000,
): Result<number> {
  if (raw === undefined) return { ok: true, value: fallback };
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!/^\d+$/.test(str)) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Параметр "${field}" має бути цілим невід'ємним числом`,
        details: { [field]: str },
      },
    };
  }
  const value = Number.parseInt(str, 10);
  if (value <= 0 || value > max) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Параметр "${field}" має бути в межах 1..${max}`,
        details: { [field]: str },
      },
    };
  }
  return { ok: true, value };
}

export function parseIsoDate(
  raw: string | string[] | undefined,
  field: string,
): Result<Date | null> {
  if (raw === undefined) return { ok: true, value: null };
  const str = Array.isArray(raw) ? raw[0] : raw;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Параметр "${field}" має бути валідною ISO-датою`,
        details: { [field]: str },
      },
    };
  }
  return { ok: true, value: d };
}

export function parseEnum<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[],
  field: string,
): Result<T | null> {
  if (raw === undefined) return { ok: true, value: null };
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!allowed.includes(str as T)) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Параметр "${field}" має бути одним з: ${allowed.join(', ')}`,
        details: { [field]: str },
      },
    };
  }
  return { ok: true, value: str as T };
}

export function parseBool(
  raw: string | string[] | undefined,
  field: string,
): Result<boolean | null> {
  if (raw === undefined) return { ok: true, value: null };
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (str === 'true') return { ok: true, value: true };
  if (str === 'false') return { ok: true, value: false };
  return {
    ok: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: `Параметр "${field}" має бути "true" або "false"`,
      details: { [field]: str },
    },
  };
}
