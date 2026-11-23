'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IoWarning, IoRefresh } from 'react-icons/io5';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to error reporting service (e.g., Sentry)
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        this.props.onReset?.();
    };

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="surface-panel w-full max-w-lg text-center space-y-6 p-8">
                        <IoWarning className="w-12 h-12 text-red-400 mx-auto" />
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
                            <p className="text-sm text-text-secondary">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={this.handleReset}
                                className="secondary-action w-full"
                            >
                                <IoRefresh className="w-4 h-4" />
                                <span>Try again</span>
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                            >
                                Reload page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
} 