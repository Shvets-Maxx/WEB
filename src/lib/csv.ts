import type { Measurement } from '@/types';

const UTF8_BOM = '﻿';
const HEADER = ['timestamp', 'PM2_5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'aqi'];

export function measurementsToCsv(series: Measurement[]): string {
  const rows = series.map((m) =>
    [
      m.timestamp,
      m.values.PM2_5,
      m.values.PM10,
      m.values.NO2,
      m.values.SO2,
      m.values.CO,
      m.values.O3,
      m.aqi,
    ].join(','),
  );
  return UTF8_BOM + [HEADER.join(','), ...rows].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
