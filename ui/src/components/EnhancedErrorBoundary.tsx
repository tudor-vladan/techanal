import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home, 
  ArrowLeft,
  Copy,
  Download,
  MessageCircle
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: this.generateErrorId(),
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // This would typically send to a service like Sentry, LogRocket, etc.
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // For now, just log to console
      console.log('Error data for reporting:', errorData);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleCopyError = () => {
    if (this.state.error) {
      const errorText = `
Error ID: ${this.state.errorId}
Message: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
      `.trim();

      navigator.clipboard.writeText(errorText).then(() => {
        // You could show a toast notification here
        console.log('Error details copied to clipboard');
      });
    }
  };

  private handleDownloadError = () => {
    if (this.state.error) {
      const errorData = {
        errorId: this.state.errorId,
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error_${this.state.errorId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  private handleReportIssue = () => {
    const errorData = this.state.error;
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Hello,

I encountered an error while using the application:

Error ID: ${this.state.errorId}
Error Message: ${errorData?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please investigate this issue.

Thank you.
    `);

    window.open(`mailto:support@techanal.com?subject=${subject}&body=${body}`);
  };

  private getErrorCategory(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('http')) {
      return 'Network Error';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'Authentication Error';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Validation Error';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Timeout Error';
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'Memory Error';
    }
    
    return 'Application Error';
  }

  private getErrorSuggestions(error: Error): string[] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Check if the service is available'
      ];
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return [
        'Try logging in again',
        'Check if your session has expired',
        'Clear browser cookies and cache'
      ];
    }
    if (message.includes('validation')) {
      return [
        'Check your input data',
        'Ensure all required fields are filled',
        'Verify data format is correct'
      ];
    }
    if (message.includes('timeout')) {
      return [
        'Try again in a few moments',
        'Check your internet connection',
        'The service might be experiencing high load'
      ];
    }
    
    return [
      'Try refreshing the page',
      'Clear browser cache and cookies',
      'Check if the issue persists'
    ];
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error!;
      const errorCategory = this.getErrorCategory(error);
      const suggestions = this.getErrorSuggestions(error);

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-900">Something went wrong</CardTitle>
              <p className="text-gray-600 mt-2">
                We're sorry, but an unexpected error occurred while processing your request.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">
                    {errorCategory}
                  </Badge>
                  <span className="text-xs text-gray-600">Error ID: {this.state.errorId}</span>
                </div>
                <p className="text-red-800 font-medium">{error.message}</p>
              </div>

              {/* Error Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Error Details</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="text-xs"
                  >
                    {this.state.showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {this.state.showDetails && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div>
                        <strong>Message:</strong> {error.message}
                      </div>
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Try these solutions:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoBack} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleCopyError}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Error
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleDownloadError}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleReportIssue}
                    className="flex items-center gap-2 text-xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Report Issue
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
