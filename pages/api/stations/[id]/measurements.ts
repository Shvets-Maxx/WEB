import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, Measurement, SortDirection } from '@/types';
import { findStation, stationMeasurements } from '@/lib/repository';
import { paginate, sendError, sendSuccess } from '@/lib/response';
import {
  parseEnum,
  parseIsoDate,
  parsePositiveInt,
} from '@/lib/validation';
import { withApiLogger } from '@/lib/withApiLogger';

const SORT_DIRS: readonly SortDirection[] = ['asc', 'desc'];

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Measurement[]>>,
): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, {
      code: 'METHOD_NOT_ALLOWED',
      message: `Метод ${req.method} не підтримується`,
    });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) {
    return sendError(res, {
      code: 'BAD_REQUEST',
      message: 'Не вказано ідентифікатор станції',
    });
  }
  const station = findStation(id);
  if (!station) {
    return sendError(res, {
      code: 'NOT_FOUND',
      message: `Станцію з id="${id}" не знайдено`,
    });
  }

  const page = parsePositiveInt(req.query.page, 1, 'page');
  if (!page.ok) return sendError(res, page.error);
  const pageSize = parsePositiveInt(
    req.query.pageSize,
    50,
    'pageSize',
    500,
  );
  if (!pageSize.ok) return sendError(res, pageSize.error);
  const fromParam = parseIsoDate(req.query.from, 'from');
  if (!fromParam.ok) return sendError(res, fromParam.error);
  const toParam = parseIsoDate(req.query.to, 'to');
  if (!toParam.ok) return sendError(res, toParam.error);
  const stepMinutes = parsePositiveInt(
    req.query.stepMinutes,
    60,
    'stepMinutes',
    360,
  );
  if (!stepMinutes.ok) return sendError(res, stepMinutes.error);
  const sortDir = parseEnum(req.query.sortDir, SORT_DIRS, 'sortDir');
  if (!sortDir.ok) return sendError(res, sortDir.error);

  const now = new Date();
  const to = toParam.value ?? now;
  const from = fromParam.value ?? new Date(to.getTime() - 24 * 60 * 60 * 1000);
  if (from.getTime() > to.getTime()) {
    return sendError(res, {
      code: 'VALIDATION_ERROR',
      message: 'Параметр "from" не може бути пізніше за "to"',
    });
  }
  if (to.getTime() - from.getTime() > 31 * 24 * 60 * 60 * 1000) {
    return sendError(res, {
      code: 'VALIDATION_ERROR',
      message: 'Інтервал запиту обмежено 31 добою',
    });
  }

  let series = stationMeasurements(station, from, to, stepMinutes.value);
  if (sortDir.value === 'desc') series = [...series].reverse();

  const { slice, meta } = paginate(series, page.value, pageSize.value);
  sendSuccess(res, slice, meta);
}

export default withApiLogger(handler, 'GET /api/stations/[id]/measurements');
