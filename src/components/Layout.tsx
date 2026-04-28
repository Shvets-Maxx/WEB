import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const NAV = [
  { href: '/', label: 'Станції' },
  { href: '/pollutants', label: 'Забруднювачі' },
  { href: '/about', label: 'Про проєкт' },
];

export default function Layout({ children }: LayoutProps): JSX.Element {
  const router = useRouter();
  return (
    <div className={styles.layout}>
      <a className="skip-link" href="#main">
        Перейти до основного вмісту
      </a>
      <nav className={styles.nav} aria-label="Головна навігація">
        <span className={styles.brand}>EcoMonitor UA</span>
        {NAV.map((item) => {
          const active =
            item.href === '/'
              ? router.pathname === '/'
              : router.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${active ? styles.linkActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <main id="main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        Лабораторна робота №1–3 · Next.js SSR · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
