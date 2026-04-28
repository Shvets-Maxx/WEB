import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, PollutantInfo } from '@/types';
import { POLLUTANTS } from '@/data/pollutants';
import { sendError, sendSuccess } from '@/lib/response';
import { withApiLogger } from '@/lib/withApiLogger';

function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PollutantInfo[]>>,
): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, {
      code: 'METHOD_NOT_ALLOWED',
      message: `Метод ${req.method} не підтримується`,
    });
  }
  sendSuccess(res, POLLUTANTS);
}

export default withApiLogger(handler, 'GET /api/pollutants');
