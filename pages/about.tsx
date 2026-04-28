export default function About(): JSX.Element {
  return (
    <>
      <h1>Про проєкт</h1>
    

      <h2>Мета</h2>
      <p>
        EcoMonitor UA — навчальний веб-додаток, який демонструє отримання,
        обробку та візуалізацію даних якості повітря з мережі моніторингових
        станцій. Проєкт виконано з дисципліни «Веб-технології».
      </p>

      <h2>Технології</h2>
      <ul>
        <li>Next.js 14 (Pages Router) — SSR та SSG</li>
        <li>React 18</li>
        <li>TypeScript зі строгою перевіркою типів</li>
        <li>Власний REST API на API Routes</li>
      </ul>

      <h2>Архітектура</h2>
      <ul>
        <li><code>src/types</code> — доменні типи та контракти API</li>
        <li><code>src/data</code> — набір тестових даних (станції, забруднювачі)</li>
        <li><code>src/lib</code> — AQI, генерація часових рядів, валідація, пагінація</li>
        <li><code>src/components</code> — UI-компоненти (картки, графік, layout)</li>
        <li><code>pages/api</code> — серверні ендпоінти REST API</li>
        <li><code>pages/stations/[id]</code> — динамічний SSR-роут</li>
      </ul>
    </>
  );
}
