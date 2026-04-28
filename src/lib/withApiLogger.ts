import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { childLogger } from './logger';
import { REQUEST_ID_HEADER, newRequestId } from './requestId';
import type { ApiResponse } from '@/types';

function firstForwardedFor(header: string | string[] | undefined): string | null {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) return null;
  const [first] = raw.split(',');
  const trimmed = first?.trim();
  return trimmed ? trimmed : null;
}

function clientIp(req: NextApiRequest): string {
  return (
    firstForwardedFor(req.headers['x-forwarded-for']) ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

export function withApiLogger<T = unknown>(
  handler: NextApiHandler<ApiResponse<T>>,
  name: string,
): NextApiHandler<ApiResponse<T>> {
  return async (req, res) => {
    const headerId = req.headers[REQUEST_ID_HEADER];
    const requestId =
      (Array.isArray(headerId) ? headerId[0] : headerId) ?? newRequestId();
    res.setHeader(REQUEST_ID_HEADER, requestId);

    const log = childLogger({
      requestId,
      route: name,
      method: req.method,
      url: req.url,
      ip: clientIp(req),
      ua: req.headers['user-agent'],
    });

    const startedAt = process.hrtime.bigint();
    log.debug('api.handler.start');

    try {
      await handler(req, res);
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const status = res.statusCode;
      const finished = {
        durationMs: Math.round(durationMs * 100) / 100,
        status,
      };
      if (status >= 500) log.error(finished, 'api.handler.done');
      else if (status >= 400) log.warn(finished, 'api.handler.done');
      else log.info(finished, 'api.handler.done');
    } catch (err) {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const errorObj =
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : { value: String(err) };
      log.error(
        { durationMs: Math.round(durationMs * 100) / 100, err: errorObj },
        'api.handler.exception',
      );
      if (!res.writableEnded) {
        sendInternalError(res);
      }
    }
  };
}

function sendInternalError(res: NextApiResponse<ApiResponse<never>>): void {
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        'Внутрішня помилка сервера. Спробуйте пізніше або зверніться до адміністратора.',
    },
  });
}
