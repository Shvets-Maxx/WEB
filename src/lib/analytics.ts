import type { AnalyticsEvent, AnalyticsEventName } from '@/types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const SESSION_KEY = 'eco.sessionId';
const SESSION_STARTED_KEY = 'eco.sessionStartedAt';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
    return id;
  } catch {
    return 'no-storage';
  }
}

function sessionDurationMs(): number {
  if (typeof window === 'undefined') return 0;
  const startedAt = Number(sessionStorage.getItem(SESSION_STARTED_KEY) ?? 0);
  return startedAt ? Date.now() - startedAt : 0;
}

export function track(
  name: AnalyticsEventName,
  props?: AnalyticsEvent['props'],
): void {
  if (typeof window === 'undefined') return;
  const event: AnalyticsEvent = {
    name,
    props: props ?? {},
    sessionId: getSessionId(),
    path: window.location.pathname + window.location.search,
    ts: new Date().toISOString(),
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, {
      ...event.props,
      session_id: event.sessionId,
      page_path: event.path,
    });
  }

  const body = JSON.stringify(event);
  if ('sendBeacon' in navigator) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }
}

export function trackPageView(path: string): void {
  track('page_view', { path });
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const measurementId = process.env.NEXT_PUBLIC_GA_ID;
    if (measurementId) {
      window.gtag('config', measurementId, { page_path: path });
    }
  }
}

export function trackPageLoadTiming(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  const entries = performance.getEntriesByType('navigation');
  const nav = entries[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return;
  track('page_load_timing', {
    domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
    loadEventMs: Math.round(nav.loadEventEnd),
    ttfbMs: Math.round(nav.responseStart),
    transferSizeBytes: nav.transferSize ?? 0,
  });
}

export function trackSessionStart(): void {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(SESSION_KEY)) return;
  getSessionId();
  track('session_start', {});
}

export function trackSessionEnd(): void {
  track('session_end', { durationMs: sessionDurationMs() });
}
