import { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { AirQualitySnapshot } from '@/types';
import { POLLUTANTS } from '@/data/pollutants';
import { POLLUTANT_COLOR } from '@/lib/pollutants';

interface Props {
  snapshot: AirQualitySnapshot;
}

interface PieDatum {
  code: keyof typeof POLLUTANT_COLOR;
  name: string;
  value: number;
  raw: number;
  unit: string;
}

const tooltipStyle: React.CSSProperties = {
  background: '#121c2f',
  border: '1px solid #26324e',
  borderRadius: 8,
  color: '#e6ecf5',
};

const tooltipItemStyle: React.CSSProperties = { color: '#e6ecf5' };
const tooltipLabelStyle: React.CSSProperties = { color: '#93a3bf' };

export default function PollutionPieChart({ snapshot }: Props): JSX.Element {
  const data = useMemo<PieDatum[]>(
    () =>
      snapshot.pollutants.map((p) => {
        const ref = POLLUTANTS.find((r) => r.code === p.code);
        const guideline = ref?.whoGuideline ?? 1;
        return {
          code: p.code,
          name: p.code,
          value: Math.round((p.value / guideline) * 1000) / 10,
          raw: p.value,
          unit: p.unit,
        };
      }),
    [snapshot],
  );

  return (
    <div
      style={{ width: '100%', height: 280 }}
      aria-label="Кругова діаграма структури забруднення у відсотках від нормативу ВООЗ"
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            isAnimationActive={false}
            label={(entry: { name: string; value: number }) =>
              `${entry.name}: ${entry.value}%`
            }
          >
            {data.map((d) => (
              <Cell key={d.code} fill={POLLUTANT_COLOR[d.code]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value: number, _name, item) => {
              const p = item?.payload as PieDatum | undefined;
              return [
                `${value}% від ВООЗ · ${p?.raw ?? ''} ${p?.unit ?? ''}`,
                p?.name ?? '',
              ];
            }}
          />
          <Legend wrapperStyle={{ color: '#93a3bf', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
