import dynamic from 'next/dynamic';
import type { StationWithSnapshot } from '@/types';
import styles from './StationsMap.module.css';

interface Props {
  stations: StationWithSnapshot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const Inner = dynamic(() => import('./StationsMap.inner'), {
  ssr: false,
  loading: () => (
    <div className={styles.placeholder} role="status" aria-live="polite">
      Завантаження карти…
    </div>
  ),
});

export default function StationsMap(props: Props): JSX.Element {
  return (
    <div
      className={styles.wrapper}
      role="region"
      aria-label="Інтерактивна карта моніторингових станцій"
    >
      <Inner {...props} />
    </div>
  );
}
