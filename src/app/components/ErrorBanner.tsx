'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={[
        'rounded-xl border border-[var(--color-error-border)]',
        'bg-[var(--color-error-surface)] p-4',
        'flex items-start gap-3',
        'animate-fade-in',
      ].join(' ')}
    >
      <AlertCircle className="h-4 w-4 text-[var(--color-error-text)] mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-error-text)] leading-relaxed">{message}</p>
        {(onRetry || onDismiss) && (
          <div className="flex gap-3 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium text-[var(--color-error-text)] hover:underline underline-offset-2 transition-all"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[var(--color-error-text)] opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
