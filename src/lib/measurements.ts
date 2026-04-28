import type {
  Measurement,
  MonitoringStation,
  PollutantCode,
  StationType,
  StationWithSnapshot,
} from '@/types';
import { indexForPollutant, overallAqi } from './aqi';
import { hashSeed, mulberry32 } from './random';

const POLLUTANT_CODES: PollutantCode[] = [
  'PM2_5',
  'PM10',
  'NO2',
  'SO2',
  'CO',
  'O3',
];

interface Baseline {
  PM2_5: number;
  PM10: number;
  NO2: number;
  SO2: number;
  CO: number;
  O3: number;
}

const BASELINES: Record<StationType, Baseline> = {
  rural: { PM2_5: 6, PM10: 12, NO2: 8, SO2: 3, CO: 0.4, O3: 70 },
  suburban: { PM2_5: 12, PM10: 22, NO2: 22, SO2: 6, CO: 0.8, O3: 60 },
  urban: { PM2_5: 18, PM10: 34, NO2: 38, SO2: 10, CO: 1.2, O3: 55 },
  traffic: { PM2_5: 24, PM10: 48, NO2: 72, SO2: 14, CO: 2.1, O3: 45 },
  industrial: { PM2_5: 28, PM10: 58, NO2: 60, SO2: 38, CO: 1.8, O3: 50 },
};

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function diurnalFactor(code: PollutantCode, hour: number): number {
  switch (code) {
    case 'NO2':
    case 'CO':
      return 1 + 0.45 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    case 'O3':
      return 1 + 0.5 * Math.sin(((hour - 14) / 24) * 2 * Math.PI);
    default:
      return 1 + 0.2 * Math.sin(((hour - 10) / 24) * 2 * Math.PI);
  }
}

function pollutantDecimals(code: PollutantCode): number {
  return code === 'CO' ? 2 : 1;
}

export function generateMeasurement(
  station: MonitoringStation,
  timestamp: Date,
): Measurement {
  const seed = hashSeed(`${station.id}:${timestamp.toISOString()}`);
  const rnd = mulberry32(seed);
  const baseline = BASELINES[station.type];
  const values = {} as Record<PollutantCode, number>;
  for (const code of POLLUTANT_CODES) {
    const base = baseline[code];
    const factor = diurnalFactor(code, timestamp.getUTCHours());
    const noise = 0.75 + rnd() * 0.6;
    const raw = Math.max(0, base * factor * noise);
    values[code] = round(raw, pollutantDecimals(code));
  }
  const { aqi } = overallAqi(
    POLLUTANT_CODES.map((code) => ({
      code,
      value: values[code],
      unit: '',
    })),
  );
  return {
    stationId: station.id,
    timestamp: timestamp.toISOString(),
    values,
    aqi,
  };
}

export function generateTimeSeries(
  station: MonitoringStation,
  from: Date,
  to: Date,
  stepMinutes = 60,
): Measurement[] {
  const points: Measurement[] = [];
  const stepMs = stepMinutes * 60 * 1000;
  for (let t = from.getTime(); t <= to.getTime(); t += stepMs) {
    points.push(generateMeasurement(station, new Date(t)));
  }
  return points;
}

export function latestSnapshot(
  station: MonitoringStation,
  now: Date = new Date(),
): StationWithSnapshot {
  const reference = new Date(now);
  reference.setMinutes(0, 0, 0);
  const m = generateMeasurement(station, reference);
  const concentrations = POLLUTANT_CODES.map((code) => ({
    code,
    value: m.values[code],
    unit: code === 'CO' ? 'мг/м³' : 'мкг/м³',
  }));
  const { aqi, dominant } = overallAqi(concentrations);
  return {
    ...station,
    latest: { aqi, pollutants: concentrations, dominant },
    updatedAt: reference.toISOString(),
  };
}

export function computePollutantAqi(
  code: PollutantCode,
  value: number,
): number {
  return indexForPollutant(code, value);
}
