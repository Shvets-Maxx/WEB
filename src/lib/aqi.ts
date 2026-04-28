import type {
  AirQualityIndex,
  PollutantCode,
  PollutantConcentration,
} from '@/types';

type Breakpoints = Record<PollutantCode, [number, number, number, number]>;

const BREAKPOINTS: Breakpoints = {
  PM2_5: [10, 20, 25, 50],
  PM10: [20, 40, 50, 100],
  NO2: [40, 90, 120, 230],
  SO2: [100, 200, 350, 500],
  CO: [4, 8, 12, 16],
  O3: [50, 100, 130, 240],
};

export function indexForPollutant(
  code: PollutantCode,
  value: number,
): AirQualityIndex {
  const thresholds = BREAKPOINTS[code];
  if (value <= thresholds[0]) return 1;
  if (value <= thresholds[1]) return 2;
  if (value <= thresholds[2]) return 3;
  if (value <= thresholds[3]) return 4;
  return 5;
}

export function overallAqi(values: PollutantConcentration[]): {
  aqi: AirQualityIndex;
  dominant: PollutantCode;
} {
  let aqi: AirQualityIndex = 1;
  let dominant: PollutantCode = values[0]?.code ?? 'PM2_5';
  for (const reading of values) {
    const current = indexForPollutant(reading.code, reading.value);
    if (current > aqi) {
      aqi = current;
      dominant = reading.code;
    }
  }
  return { aqi, dominant };
}

export function aqiLabel(aqi: AirQualityIndex): string {
  switch (aqi) {
    case 1:
      return 'Добре';
    case 2:
      return 'Задовільно';
    case 3:
      return 'Помірне забруднення';
    case 4:
      return 'Шкідливе';
    case 5:
      return 'Дуже шкідливе';
  }
}
