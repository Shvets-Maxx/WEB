export type PollutantCode =
  | 'PM2_5'
  | 'PM10'
  | 'NO2'
  | 'SO2'
  | 'CO'
  | 'O3';

export interface PollutantInfo {
  code: PollutantCode;
  name: string;
  unit: string;
  description: string;
  whoGuideline: number;
}

export interface PollutantConcentration {
  code: PollutantCode;
  value: number;
  unit: string;
}

export type AirQualityIndex = 1 | 2 | 3 | 4 | 5;

export interface AirQualitySnapshot {
  aqi: AirQualityIndex;
  pollutants: PollutantConcentration[];
  dominant: PollutantCode;
}
