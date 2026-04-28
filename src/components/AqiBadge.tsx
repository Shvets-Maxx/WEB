import type { AirQualityIndex } from '@/types';
import { aqiLabel } from '@/lib/aqi';

interface Props {
  aqi: AirQualityIndex;
}

export default function AqiBadge({ aqi }: Props): JSX.Element {
  return <span className={`badge aqi-${aqi}`}>AQI {aqi} · {aqiLabel(aqi)}</span>;
}
