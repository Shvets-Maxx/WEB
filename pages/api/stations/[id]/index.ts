import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, StationWithSnapshot } from '@/types';
import { findStation } from '@/lib/repository';
import { latestSnapshot } from '@/lib/measurements';
import { sendError, sendSuccess } from '@/lib/response';
import { withApiLogger } from '@/lib/withApiLogger';

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<StationWithSnapshot>>,
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
  sendSuccess(res, latestSnapshot(station));
}

export default withApiLogger(handler, 'GET /api/stations/[id]/index');
