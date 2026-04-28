import type { NextApiRequest, NextApiResponse } from 'next';
import type { AnalyticsEvent, ApiResponse } from '@/types';
import { sendError, sendSuccess } from '@/lib/response';
import { withApiLogger } from '@/lib/withApiLogger';
import { childLogger } from '@/lib/logger';

const VALID_NAMES = new Set([
  'page_view',
  'page_load_timing',
  'session_start',
  'session_end',
  'station_detail_viewed',
  'map_station_selected',
  'map_zoom_changed',
  'chart_filter_toggled',
  'compare_pollutant_changed',
  'data_exported',
  'error_boundary_triggered',
]);

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    VALID_NAMES.has(v.name) &&
    typeof v.sessionId === 'string' &&
    typeof v.path === 'string' &&
    typeof v.ts === 'string'
  );
}

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ accepted: true }>>,
): void {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, {
      code: 'METHOD_NOT_ALLOWED',
      message: `Метод ${req.method} не підтримується`,
    });
  }
  if (!isAnalyticsEvent(req.body)) {
    return sendError(res, {
      code: 'VALIDATION_ERROR',
      message: 'Невірний формат події аналітики',
    });
  }

  const log = childLogger({
    kind: 'analytics',
    event: req.body.name,
    sessionId: req.body.sessionId,
    path: req.body.path,
  });
  log.info({ props: req.body.props ?? {}, eventTs: req.body.ts }, 'analytics.event');

  sendSuccess(res, { accepted: true });
}

export default withApiLogger(handler, 'POST /api/analytics');
