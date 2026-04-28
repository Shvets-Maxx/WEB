import { STATIONS } from '@/data/stations';
import type {
  Measurement,
  MonitoringStation,
  StationWithSnapshot,
} from '@/types';
import { generateTimeSeries, latestSnapshot } from './measurements';

export function listStations(): MonitoringStation[] {
  return [...STATIONS];
}

export function findStation(id: string): MonitoringStation | null {
  return STATIONS.find((s) => s.id === id) ?? null;
}

export function listStationsWithSnapshots(
  now: Date = new Date(),
): StationWithSnapshot[] {
  return STATIONS.map((s) => latestSnapshot(s, now));
}

export function stationMeasurements(
  station: MonitoringStation,
  from: Date,
  to: Date,
  stepMinutes = 60,
): Measurement[] {
  return generateTimeSeries(station, from, to, stepMinutes);
}

export function defaultWindow(now: Date = new Date()): { from: Date; to: Date } {
  const to = new Date(now);
  to.setMinutes(0, 0, 0);
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return { from, to };
}
