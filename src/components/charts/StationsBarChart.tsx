import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PollutantCode, StationWithSnapshot } from '@/types';
import { POLLUTANTS } from '@/data/pollutants';
import { aqiColor } from '@/lib/aqiColor';

interface Props {
  stations: StationWithSnapshot[];
  pollutant: PollutantCode;
  selectedId?: string | null;
}

const tooltipStyle: React.CSSProperties = {
  background: '#121c2f',
  border: '1px solid #26324e',
  borderRadius: 8,
  color: '#e6ecf5',
};

const tooltipItemStyle: React.CSSProperties = { color: '#e6ecf5' };
const tooltipLabelStyle: React.CSSProperties = { color: '#93a3bf' };

export default function StationsBarChart({
  stations,
  pollutant,
  selectedId,
}: Props): JSX.Element {
  const info = POLLUTANTS.find((p) => p.code === pollutant);

  const data = useMemo(
    () =>
      stations.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        aqi: s.latest.aqi,
        value:
          s.latest.pollutants.find((p) => p.code === pollutant)?.value ?? 0,
      })),
    [stations, pollutant],
  );

  return (
    <div
      style={{ width: '100%', height: 300 }}
      aria-label={`Стовпчикова діаграма концентрації ${pollutant} по станціях`}
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
        >
          <CartesianGrid stroke="#26324e" strokeDasharray="3 3" />
          <XAxis
            dataKey="city"
            stroke="#93a3bf"
            fontSize={11}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis
            stroke="#93a3bf"
            fontSize={11}
            label={{
              value: info?.unit,
              angle: -90,
              position: 'insideLeft',
              fill: '#93a3bf',
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.name ?? ''
            }
            formatter={(v: number) => [`${v} ${info?.unit ?? ''}`, pollutant]}
          />
          <Legend wrapperStyle={{ color: '#93a3bf', fontSize: 12 }} />
          <Bar dataKey="value" name={pollutant}>
            {data.map((d) => (
              <Cell
                key={d.id}
                fill={aqiColor(d.aqi)}
                stroke={d.id === selectedId ? '#ffffff' : 'transparent'}
                strokeWidth={d.id === selectedId ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
