'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-heading text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-text-secondary mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button onClick={this.handleRetry} variant="primary" className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 