import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--glass-bg-base)] text-[var(--text-primary)] p-8 flex flex-col items-center justify-center backdrop-blur-3xl">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-[var(--glass-bg-hover)] p-6 rounded-3xl border border-[var(--glass-border)] max-w-2xl w-full overflow-auto shadow-2xl">
                        <h2 className="text-xl font-semibold mb-2">{this.state.error?.toString()}</h2>
                        <pre className="text-sm opacity-70 whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-8 py-3 bg-theme text-white font-bold rounded-full shadow-lg shadow-theme/30 hover:shadow-theme/50 transition-all active:scale-95"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
