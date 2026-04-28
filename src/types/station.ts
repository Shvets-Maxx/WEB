import type { AirQualitySnapshot } from './pollutants';

export type StationType = 'urban' | 'suburban' | 'rural' | 'industrial' | 'traffic';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  country: string;
  type: StationType;
  coordinates: GeoCoordinates;
  elevation: number;
  operator: string;
  installedAt: string;
  active: boolean;
}

export interface StationWithSnapshot extends MonitoringStation {
  latest: AirQualitySnapshot;
  updatedAt: string;
}
