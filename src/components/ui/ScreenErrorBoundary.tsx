import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { err: Error | null };

export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ScreenErrorBoundary', error, info);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[#0f0a06] p-6 text-center">
          <p className="font-title text-lg text-[#c9a227]">Something went wrong ⚔️</p>
          <button
            type="button"
            className="fantasy-button px-6 py-3"
            onClick={() => this.setState({ err: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
