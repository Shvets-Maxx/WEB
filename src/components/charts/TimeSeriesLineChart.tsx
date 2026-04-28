import { useCallback, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Measurement, PollutantCode } from '@/types';
import { POLLUTANT_CODES, POLLUTANT_COLOR } from '@/lib/pollutants';
import { POLLUTANTS } from '@/data/pollutants';
import PollutantPicker from '../PollutantPicker';
import { track } from '@/lib/analytics';

const DEFAULT_VISIBLE: PollutantCode[] = ['PM2_5', 'NO2', 'O3'];

interface Props {
  series: Measurement[];
}

const tooltipStyle: React.CSSProperties = {
  background: '#121c2f',
  border: '1px solid #26324e',
  borderRadius: 8,
  color: '#e6ecf5',
};

const tooltipItemStyle: React.CSSProperties = { color: '#e6ecf5' };
const tooltipLabelStyle: React.CSSProperties = { color: '#93a3bf' };

export default function TimeSeriesLineChart({ series }: Props): JSX.Element {
  const [visible, setVisible] = useState<Set<PollutantCode>>(
    () => new Set(DEFAULT_VISIBLE),
  );

  const toggle = useCallback((code: PollutantCode): void => {
    setVisible((prev) => {
      const next = new Set(prev);
      const turnedOn = !next.has(code);
      if (turnedOn) next.add(code);
      else next.delete(code);
      track('chart_filter_toggled', { pollutant: code, visible: turnedOn });
      return next;
    });
  }, []);

  const data = useMemo(
    () =>
      series.map((m) => ({
        t: new Date(m.timestamp).toLocaleTimeString('uk-UA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        ...m.values,
      })),
    [series],
  );

  const visibleCodes = useMemo(
    () => POLLUTANT_CODES.filter((c) => visible.has(c)),
    [visible],
  );

  return (
    <div>
      <PollutantPicker
        label="Обрати забруднювачі для графіка"
        mode="multi"
        value={visible}
        onChange={toggle}
      />
      <div
        style={{ width: '100%', height: 280 }}
        aria-label="Лінійний графік динаміки забруднювачів"
      >
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#26324e" strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#93a3bf" fontSize={11} />
            <YAxis stroke="#93a3bf" fontSize={11} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value: number, name: string) => {
                const ref = POLLUTANTS.find((p) => p.code === name);
                return [`${value} ${ref?.unit ?? ''}`, name];
              }}
            />
            <Legend wrapperStyle={{ color: '#93a3bf', fontSize: 12 }} />
            {visibleCodes.map((code) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={POLLUTANT_COLOR[code]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
