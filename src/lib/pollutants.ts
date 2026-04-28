import type { PollutantCode } from '@/types';

export const POLLUTANT_CODES: readonly PollutantCode[] = [
  'PM2_5',
  'PM10',
  'NO2',
  'SO2',
  'CO',
  'O3',
];

export const POLLUTANT_COLOR: Record<PollutantCode, string> = {
  PM2_5: '#4cc9f0',
  PM10: '#8b5cf6',
  NO2: '#f472b6',
  SO2: '#facc15',
  CO: '#fb923c',
  O3: '#4ade80',
};
