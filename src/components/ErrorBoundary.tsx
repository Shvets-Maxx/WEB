import { Component, type ErrorInfo, type ReactNode } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    try {
      track('error_boundary_triggered', { message: error.message });
      const payload = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        path:
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : 'ssr',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ts: new Date().toISOString(),
      };
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon(
          '/api/client-error',
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        );
      } else {
        void fetch('/api/client-error', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      // swallow reporting errors
    }
  }

  private reset = (): void => this.setState({ error: null });

  public render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div className="card" style={{ margin: 32 }}>
          <h2>Виникла помилка в інтерфейсі</h2>
          <p className="meta">
            Подію записано у журнал. Ви можете спробувати продовжити роботу.
          </p>
          <p style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>
            {error.message}
          </p>
          <button
            type="button"
            className="pill"
            onClick={this.reset}
            style={{ cursor: 'pointer', marginTop: 8 }}
          >
            Повторити
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
