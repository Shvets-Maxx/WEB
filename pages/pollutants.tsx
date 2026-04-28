import type { GetStaticProps } from 'next';
import type { PollutantInfo } from '@/types';
import { POLLUTANTS } from '@/data/pollutants';

interface PollutantsProps {
  items: PollutantInfo[];
}

export const getStaticProps: GetStaticProps<PollutantsProps> = async () => ({
  props: { items: POLLUTANTS },
});

export default function PollutantsPage({ items }: PollutantsProps): JSX.Element {
  return (
    <>
      <h1>Довідник забруднювачів</h1>
      <p className="lead">
        Сторінка статично згенерована (SSG). Показує основні забруднювачі повітря
        та рекомендовані ВООЗ граничні значення.
      </p>
      <div className="grid cards">
        {items.map((p) => (
          <article key={p.code} className="card">
            <h3>{p.name}</h3>
            <div className="meta">Код: <strong>{p.code}</strong></div>
            <p className="pollutant-desc">{p.description}</p>
            <div className="meta">
              Норматив ВООЗ: <strong>{p.whoGuideline} {p.unit}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
