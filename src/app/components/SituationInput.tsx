'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface SituationInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
}

const EXAMPLE_PROMPTS = [
  'Movie night for 6 people',
  'Guests arriving tonight for dinner',
  'Making biryani for the family',
  'Weekend camping trip with friends',
  "Baby's first birthday party",
  'Late night study session',
];

export function SituationInput({ onSubmit, isLoading, value, onChange }: SituationInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!value.trim()) {
      setError('Please describe your situation first.');
      return;
    }
    if (value.length > 500) {
      setError('Keep it under 500 characters.');
      return;
    }
    onSubmit(value);
  };

  const handleExampleClick = (prompt: string) => {
    onChange(prompt);
    setError(null);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea */}
        <div>
          <Textarea
            id="situation-input"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. 'making biryani for 8 people' or 'guests arriving tonight for snacks and drinks'…"
            maxLength={500}
            rows={3}
            disabled={isLoading}
            className="text-base leading-relaxed resize-none"
            aria-describedby="char-count input-error"
          />
          <div className="flex justify-between items-center mt-1.5 px-0.5">
            {error ? (
              <p id="input-error" className="text-sm text-[var(--color-error-text)]" role="alert">
                {error}
              </p>
            ) : <span />}
            <p
              id="char-count"
              className={[
                'text-xs ml-auto tabular-nums transition-colors',
                value.length > 450 ? 'text-[var(--color-warning-text)]' : 'text-[var(--text-muted)]',
              ].join(' ')}
              aria-live="polite"
            >
              {value.length}/500
            </p>
          </div>
        </div>

        {/* CTA — amber/shop variant */}
        <Button
          type="submit"
          disabled={isLoading || !value.trim()}
          variant="shop"
          size="lg"
          className="w-full group text-base"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating your cart…</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Generate Smart Cart</span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
            </span>
          )}
        </Button>
      </form>

      {/* Example prompts — bigger, more prominent */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleExampleClick(prompt)}
              disabled={isLoading}
              className={[
                'px-4 py-2 text-sm rounded-lg font-medium',
                'bg-[var(--surface-raised)] text-[var(--text-secondary)]',
                'border border-[var(--border-default)]',
                'hover:border-[var(--color-accent-500)]',
                'hover:text-[var(--color-accent-600)]',
                'hover:bg-[var(--color-accent-50)]',
                'transition-all duration-150 cursor-pointer',
                'disabled:opacity-40 disabled:pointer-events-none',
              ].join(' ')}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
