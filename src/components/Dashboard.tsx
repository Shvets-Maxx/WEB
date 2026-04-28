import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import type { PollutantCode, StationWithSnapshot } from '@/types';
import AqiBadge from './AqiBadge';
import PollutantPicker from './PollutantPicker';
import StationsMap from './StationsMap';
import { STATION_TYPE_LABEL } from '@/lib/stationType';
import { useStationSeries } from '@/hooks/useStationSeries';
import { track } from '@/lib/analytics';
import { downloadCsv, measurementsToCsv } from '@/lib/csv';
import styles from './Dashboard.module.css';

const TimeSeriesLineChart = dynamic(
  () => import('./charts/TimeSeriesLineChart'),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> },
);
const StationsBarChart = dynamic(
  () => import('./charts/StationsBarChart'),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> },
);
const PollutionPieChart = dynamic(
  () => import('./charts/PollutionPieChart'),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> },
);

function ChartSkeleton({ height }: { height: number }): JSX.Element {
  return (
    <div
      className={styles.chartSkeleton}
      style={{ height }}
      role="status"
      aria-live="polite"
    >
      Завантаження графіка…
    </div>
  );
}

interface Props {
  stations: StationWithSnapshot[];
}

export default function Dashboard({ stations }: Props): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(
    stations[0]?.id ?? null,
  );
  const [comparePollutant, setComparePollutant] =
    useState<PollutantCode>('PM2_5');

  const { series, loading, error } = useStationSeries(selectedId);

  const selected = useMemo(
    () => stations.find((s) => s.id === selectedId) ?? null,
    [stations, selectedId],
  );

  const handleSelect = useCallback((id: string): void => {
    setSelectedId(id);
    track('map_station_selected', { stationId: id });
  }, []);

  const handleCompareChange = useCallback((code: PollutantCode): void => {
    setComparePollutant(code);
    track('compare_pollutant_changed', { pollutant: code });
  }, []);

  const handleReset = useCallback((): void => setSelectedId(null), []);

  const handleExportCsv = useCallback((): void => {
    if (!selected || series.length === 0) return;
    downloadCsv(`${selected.id}-24h.csv`, measurementsToCsv(series));
    track('data_exported', {
      stationId: selected.id,
      rows: series.length,
      format: 'csv',
    });
  }, [selected, series]);

  return (
    <>
      <section aria-label="Мапа станцій та зведення">
        <div className={styles.grid}>
          <div className={`card ${styles.mapCard}`}>
            <StationsMap
              stations={stations}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          <div className="card">
            {selected ? (
              <SelectedStationPanel
                station={selected}
                hasSeries={series.length > 0}
                onExport={handleExportCsv}
                onReset={handleReset}
              />
            ) : (
              <p className="muted">
                Оберіть станцію на карті, щоб побачити графіки.
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Динаміка обраної станції">
        <h2>Динаміка показників обраної станції (24 год)</h2>
        {!selected ? (
          <div className="card">Станція не вибрана.</div>
        ) : loading ? (
          <ChartSkeleton height={280} />
        ) : error ? (
          <div className="card" role="alert">
            Помилка: {error}
          </div>
        ) : (
          <TimeSeriesLineChart series={series} />
        )}
      </section>

      <section aria-label="Порівняння станцій">
        <h2>Порівняння станцій за забруднювачем</h2>
        <PollutantPicker
          label="Забруднювач для порівняння"
          mode="single"
          value={comparePollutant}
          onChange={handleCompareChange}
        />
        <StationsBarChart
          stations={stations}
          pollutant={comparePollutant}
          selectedId={selectedId}
        />
      </section>
    </>
  );
}

interface SelectedStationPanelProps {
  station: StationWithSnapshot;
  hasSeries: boolean;
  onExport: () => void;
  onReset: () => void;
}

function SelectedStationPanel({
  station,
  hasSeries,
  onExport,
  onReset,
}: SelectedStationPanelProps): JSX.Element {
  return (
    <>
      <header className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>{station.name}</h3>
          <p className="meta">
            {station.city} · {STATION_TYPE_LABEL[station.type]}
          </p>
        </div>
        <AqiBadge aqi={station.latest.aqi} />
      </header>
      <p className={`meta ${styles.panelDominant}`}>
        Домінуючий забруднювач: <strong>{station.latest.dominant}</strong>
      </p>
      <h4 className={styles.panelSubtitle}>
        Структура перевищення нормативів ВООЗ
      </h4>
      <PollutionPieChart snapshot={station.latest} />
      <div className={`pill-row ${styles.panelActions}`}>
        <Link href={`/stations/${station.id}`} className="pill">
          Детальна сторінка →
        </Link>
        <button
          type="button"
          onClick={onExport}
          disabled={!hasSeries}
          className="pill pill-button"
        >
          Експорт CSV
        </button>
        <button
          type="button"
          onClick={onReset}
          className="pill pill-button"
        >
          Скинути вибір
        </button>
      </div>
    </>
  );
}
