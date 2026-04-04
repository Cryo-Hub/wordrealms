import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../../i18n';

type Props = { children: ReactNode };
type State = { err: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-deep)] p-6 text-center text-[var(--text-primary)]">
          <h1 className="font-title text-xl">{t('error.something_wrong')}</h1>
          <p className="max-w-sm font-body text-sm text-[var(--text-muted)]">{this.state.err.message}</p>
          <button
            type="button"
            className="fantasy-button px-6 py-3"
            onClick={() => {
              try {
                localStorage.clear();
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
          >
            {t('error.restart')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
