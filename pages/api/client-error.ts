import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse } from '@/types';
import { sendError, sendSuccess } from '@/lib/response';
import { withApiLogger } from '@/lib/withApiLogger';
import { childLogger } from '@/lib/logger';

interface ClientErrorPayload {
  message: string;
  stack?: string;
  componentStack?: string;
  path: string;
  sessionId?: string;
  userAgent?: string;
  ts: string;
  context?: Record<string, unknown>;
}

function isPayload(v: unknown): v is ClientErrorPayload {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.message === 'string' && typeof o.path === 'string' && typeof o.ts === 'string';
}

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ recorded: true }>>,
): void {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, {
      code: 'METHOD_NOT_ALLOWED',
      message: `Метод ${req.method} не підтримується`,
    });
  }
  if (!isPayload(req.body)) {
    return sendError(res, {
      code: 'VALIDATION_ERROR',
      message: 'Невірний формат повідомлення про помилку',
    });
  }
  const log = childLogger({ kind: 'client-error', path: req.body.path });
  log.error(
    {
      err: {
        message: req.body.message,
        stack: req.body.stack,
        componentStack: req.body.componentStack,
      },
      sessionId: req.body.sessionId,
      userAgent: req.body.userAgent,
      context: req.body.context,
      clientTs: req.body.ts,
    },
    'client.error',
  );
  sendSuccess(res, { recorded: true });
}

export default withApiLogger(handler, 'POST /api/client-error');
