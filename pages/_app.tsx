import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  track,
  trackPageLoadTiming,
  trackPageView,
  trackSessionEnd,
  trackSessionStart,
} from '@/lib/analytics';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    trackSessionStart();
    const onLoad = (): void => trackPageLoadTiming();
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') trackSessionEnd();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('load', onLoad);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    trackPageView(router.asPath);
  }, [router.asPath]);

  useEffect(() => {
    const onError = (ev: ErrorEvent): void => {
      track('error_boundary_triggered', {
        message: ev.message,
        source: ev.filename ?? null,
        line: ev.lineno ?? 0,
      });
    };
    const onRejection = (ev: PromiseRejectionEvent): void => {
      const reason =
        ev.reason instanceof Error ? ev.reason.message : String(ev.reason);
      track('error_boundary_triggered', { message: reason, kind: 'unhandledrejection' });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <>
      <Head>
        <title>EcoMonitor UA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Моніторинг якості повітря в Україні" />
      </Head>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
      <ErrorBoundary>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ErrorBoundary>
    </>
  );
}
