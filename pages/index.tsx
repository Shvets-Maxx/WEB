import type { GetServerSideProps } from 'next';
import type { StationWithSnapshot } from '@/types';
import { listStationsWithSnapshots } from '@/lib/repository';
import Dashboard from '@/components/Dashboard';

interface HighlightStation {
  id: string;
  name: string;
  aqi: number;
}

interface HomeStats {
  total: number;
  active: number;
  avgAqi: number;
  worst: HighlightStation | null;
  best: HighlightStation | null;
}

interface HomeProps {
  stations: StationWithSnapshot[];
  generatedAt: string;
  stats: HomeStats;
}

function highlight(station: StationWithSnapshot): HighlightStation {
  return { id: station.id, name: station.name, aqi: station.latest.aqi };
}

function computeStats(stations: StationWithSnapshot[]): HomeStats {
  const active = stations.filter((s) => s.active);
  const sorted = [...stations].sort((a, b) => a.latest.aqi - b.latest.aqi);
  const avgAqi = stations.length
    ? stations.reduce((sum, s) => sum + s.latest.aqi, 0) / stations.length
    : 0;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return {
    total: stations.length,
    active: active.length,
    avgAqi: Math.round(avgAqi * 100) / 100,
    best: first ? highlight(first) : null,
    worst: last ? highlight(last) : null,
  };
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const stations = listStationsWithSnapshots();
  return {
    props: {
      stations,
      generatedAt: new Date().toISOString(),
      stats: computeStats(stations),
    },
  };
};

export default function Home({
  stations,
  generatedAt,
  stats,
}: HomeProps): JSX.Element {
  return (
    <>
      <h1>Моніторинг якості повітря</h1>
      <p className="lead">
        SSR-дані станом на {new Date(generatedAt).toLocaleString('uk-UA')}. Клік
        на маркер — вибір станції, автопідтягування графіків.
      </p>

      <section aria-label="Загальна статистика">
        <h2>Загальна статистика</h2>
        <dl className="grid stats">
          <Stat label="Усього станцій" value={stats.total} />
          <Stat label="Активних" value={stats.active} />
          <Stat label="Середній AQI" value={stats.avgAqi} />
          {stats.best ? (
            <Stat label="Найчистіша" value={stats.best.name} hint={`AQI ${stats.best.aqi}`} small />
          ) : null}
          {stats.worst ? (
            <Stat label="Найбрудніша" value={stats.worst.name} hint={`AQI ${stats.worst.aqi}`} small />
          ) : null}
        </dl>
      </section>

      <Dashboard stations={stations} />
    </>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  small?: boolean;
}

function Stat({ label, value, hint, small }: StatProps): JSX.Element {
  return (
    <div className="stat">
      <dt className="label">{label}</dt>
      <dd className={`value${small ? ' value-sm' : ''}`}>{value}</dd>
      {hint ? <p className="meta">{hint}</p> : null}
    </div>
  );
}
