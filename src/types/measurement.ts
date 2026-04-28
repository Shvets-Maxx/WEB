import type { AirQualityIndex, PollutantCode } from './pollutants';

export interface Measurement {
  stationId: string;
  timestamp: string;
  values: Record<PollutantCode, number>;
  aqi: AirQualityIndex;
}
