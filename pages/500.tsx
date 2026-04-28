import Link from 'next/link';

export default function InternalError(): JSX.Element {
  return (
    <>
      <h1>Внутрішня помилка сервера</h1>
      <p className="lead">
        Щось пішло не так під час обробки запиту. Подію вже записано у журнал.
      </p>
      <p>
        <Link href="/">← На головну</Link>
      </p>
    </>
  );
}
