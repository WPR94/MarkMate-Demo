import React from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary] Caught error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 max-w-3xl mx-auto">
          <div className="border border-red-200 bg-red-50 text-red-800 rounded p-4">
            <div className="font-semibold mb-1">Something went wrong</div>
            <p className="text-sm">Please refresh the page or try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
