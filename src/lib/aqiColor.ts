import type { AirQualityIndex } from '@/types';

export function aqiColor(aqi: AirQualityIndex): string {
  switch (aqi) {
    case 1:
      return '#4ade80';
    case 2:
      return '#a3e635';
    case 3:
      return '#facc15';
    case 4:
      return '#fb923c';
    case 5:
      return '#ef4444';
  }
}
