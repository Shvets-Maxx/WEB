import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  ApiResponse,
  MonitoringStation,
  SortDirection,
  StationType,
} from '@/types';
import { listStations } from '@/lib/repository';
import { paginate, sendError, sendSuccess } from '@/lib/response';
import {
  parseBool,
  parseEnum,
  parsePositiveInt,
} from '@/lib/validation';
import { withApiLogger } from '@/lib/withApiLogger';

const STATION_TYPES: readonly StationType[] = [
  'urban',
  'suburban',
  'rural',
  'industrial',
  'traffic',
];
const SORT_FIELDS = ['name', 'city', 'installedAt'] as const;
const SORT_DIRS: readonly SortDirection[] = ['asc', 'desc'];

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<MonitoringStation[]>>,
): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, {
      code: 'METHOD_NOT_ALLOWED',
      message: `Метод ${req.method} не підтримується`,
    });
  }

  const page = parsePositiveInt(req.query.page, 1, 'page');
  if (!page.ok) return sendError(res, page.error);
  const pageSize = parsePositiveInt(req.query.pageSize, 20, 'pageSize', 100);
  if (!pageSize.ok) return sendError(res, pageSize.error);
  const type = parseEnum(req.query.type, STATION_TYPES, 'type');
  if (!type.ok) return sendError(res, type.error);
  const sortBy = parseEnum(req.query.sortBy, SORT_FIELDS, 'sortBy');
  if (!sortBy.ok) return sendError(res, sortBy.error);
  const sortDir = parseEnum(req.query.sortDir, SORT_DIRS, 'sortDir');
  if (!sortDir.ok) return sendError(res, sortDir.error);
  const active = parseBool(req.query.active, 'active');
  if (!active.ok) return sendError(res, active.error);

  let items = listStations();
  if (type.value) items = items.filter((s) => s.type === type.value);
  if (active.value !== null) {
    const wanted = active.value;
    items = items.filter((s) => s.active === wanted);
  }
  if (typeof req.query.city === 'string') {
    const needle = req.query.city.toLowerCase();
    items = items.filter((s) => s.city.toLowerCase().includes(needle));
  }
  if (sortBy.value) {
    const field = sortBy.value;
    const dir = sortDir.value === 'desc' ? -1 : 1;
    items = [...items].sort((a, b) =>
      a[field] < b[field] ? -1 * dir : a[field] > b[field] ? 1 * dir : 0,
    );
  }

  const { slice, meta } = paginate(items, page.value, pageSize.value);
  sendSuccess(res, slice, meta);
}

export default withApiLogger(handler, 'GET /api/stations');
