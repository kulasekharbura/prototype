'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const STEPS = [
  { label: 'Understanding your situation',          detail: 'Reading intent and context…' },
  { label: 'Identifying needs',                     detail: 'Detecting occasion, group size, constraints…' },
  { label: 'Building your cart',                    detail: 'Selecting items from catalog…' },
  { label: 'Optimizing for household preferences',  detail: 'Adjusting quantities, diet, budget…' },
  { label: 'Finalising',                            detail: 'Almost there…' },
];

export function LoadingState() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  return (
    <div className="w-full animate-fade-in space-y-5">

      {/* ── AI status card ── */}
      <div className={[
        'rounded-xl border border-[var(--color-ai-border)]',
        'bg-[var(--color-ai-surface)]',
        'p-5',
      ].join(' ')}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-accent-500)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              AI is building your cart
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {STEPS[stepIdx].detail}
            </p>
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-2.5 mb-5">
          {STEPS.map((step, i) => {
            const done    = i < stepIdx;
            const current = i === stepIdx;
            return (
              <div key={i} className="flex items-center gap-3">
                {/* Status dot */}
                <div className={[
                  'h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                  done    ? 'bg-[var(--color-success-text)]'  : '',
                  current ? 'bg-[var(--color-accent-500)]'    : '',
                  !done && !current ? 'bg-[var(--border-default)]' : '',
                ].join(' ')}>
                  {done && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {current && (
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <span className={[
                  'text-sm transition-all duration-300',
                  done    ? 'text-[var(--text-muted)] line-through'        : '',
                  current ? 'text-[var(--text-primary)] font-semibold'     : '',
                  !done && !current ? 'text-[var(--text-muted)] opacity-50' : '',
                ].join(' ')}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[var(--border-default)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-accent-500)] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1.5 text-right tabular-nums">
          {pct}%
        </p>
      </div>

      {/* ── Skeleton cart preview ── */}
      <div className={[
        'rounded-xl border border-[var(--border-default)]',
        'bg-[var(--surface-card)] p-5 space-y-3',
      ].join(' ')}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Cart preview
        </p>
        {[0.75, 0.55, 0.85, 0.6, 0.7].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border-default)] last:border-0">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 rounded" style={{ width: `${w * 100}%` }} />
              <Skeleton className="h-2.5 rounded w-1/3" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-3.5 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
