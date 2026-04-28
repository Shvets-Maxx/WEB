import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import type { Measurement, StationWithSnapshot } from '@/types';
import { findStation, stationMeasurements } from '@/lib/repository';
import { latestSnapshot } from '@/lib/measurements';
import { POLLUTANTS } from '@/data/pollutants';
import AqiBadge from '@/components/AqiBadge';
import { STATION_TYPE_LABEL } from '@/lib/stationType';
import { track } from '@/lib/analytics';
import styles from './StationDetail.module.css';

const TimeSeriesLineChart = dynamic(
  () => import('@/components/charts/TimeSeriesLineChart'),
  { ssr: false },
);
const PollutionPieChart = dynamic(
  () => import('@/components/charts/PollutionPieChart'),
  { ssr: false },
);

interface DetailProps {
  station: StationWithSnapshot;
  series: Measurement[];
}

export const getServerSideProps: GetServerSideProps<DetailProps> = async (
  ctx,
) => {
  const raw = ctx.params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) return { notFound: true };
  const station = findStation(id);
  if (!station) return { notFound: true };

  const to = new Date();
  to.setMinutes(0, 0, 0);
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  const series = stationMeasurements(station, from, to, 60);

  return {
    props: {
      station: latestSnapshot(station, to),
      series,
    },
  };
};

export default function StationDetail({
  station,
  series,
}: DetailProps): JSX.Element {
  useEffect(() => {
    track('station_detail_viewed', {
      stationId: station.id,
      city: station.city,
      type: station.type,
      aqi: station.latest.aqi,
    });
  }, [station.id, station.city, station.type, station.latest.aqi]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1>{station.name}</h1>
          <p className="lead">
            {station.city}, {station.country} ·{' '}
            {STATION_TYPE_LABEL[station.type]} · Оператор: {station.operator}
          </p>
        </div>
        <AqiBadge aqi={station.latest.aqi} />
      </header>

      <section aria-label="Метадані станції">
        <h2>Метадані станції</h2>
        <dl className="grid stats">
          <StatItem label="Координати">
            {station.coordinates.latitude.toFixed(4)},{' '}
            {station.coordinates.longitude.toFixed(4)}
          </StatItem>
          <StatItem label="Висота">{station.elevation} м</StatItem>
          <StatItem label="Встановлено">{station.installedAt}</StatItem>
          <StatItem label="Домінуючий забруднювач">
            {station.latest.dominant}
          </StatItem>
        </dl>
      </section>

      <section aria-label="Поточні показники забруднення">
        <h2>Поточні показники</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Забруднювач</th>
              <th scope="col">Концентрація</th>
              <th scope="col">Норматив ВООЗ</th>
            </tr>
          </thead>
          <tbody>
            {station.latest.pollutants.map((p) => {
              const ref = POLLUTANTS.find((x) => x.code === p.code);
              return (
                <tr key={p.code}>
                  <th scope="row">{ref?.name ?? p.code}</th>
                  <td>
                    <strong>{p.value.toFixed(2)}</strong> {p.unit}
                  </td>
                  <td>{ref ? `${ref.whoGuideline} ${ref.unit}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section aria-label="Графіки" className={styles.chartsGrid}>
        <div>
          <h2>Динаміка за 24 години</h2>
          <TimeSeriesLineChart series={series} />
        </div>
        <div>
          <h2>Структура забруднення</h2>
          <PollutionPieChart snapshot={station.latest} />
        </div>
      </section>

      <p className={styles.backLink}>
        <Link href="/">← До карти станцій</Link>
      </p>
    </>
  );
}

interface StatItemProps {
  label: string;
  children: React.ReactNode;
}

function StatItem({ label, children }: StatItemProps): JSX.Element {
  return (
    <div className="stat">
      <dt className="label">{label}</dt>
      <dd className="value">{children}</dd>
    </div>
  );
}
