import Link from 'next/link';

export default function NotFound(): JSX.Element {
  return (
    <>
      <h1>Сторінку не знайдено</h1>
      <p className="lead">Можливо, ви перейшли за застарілим посиланням.</p>
      <p>
        <Link href="/">← Повернутися на головну</Link>
      </p>
    </>
  );
}
