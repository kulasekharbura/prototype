'use client';

import { CartReasoning } from '@/types/index';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AIReasoningPanelProps {
  reasoning: CartReasoning;
}

const budgetLabel: Record<string, string> = {
  budget:   'Budget',
  moderate: 'Moderate',
  premium:  'Premium',
};

export function AIReasoningPanel({ reasoning }: AIReasoningPanelProps) {
  return (
    <div
      className={[
        'rounded-xl border border-[var(--color-ai-border)]',
        'bg-[var(--color-ai-surface)]',
        'p-5 space-y-3',
        'animate-fade-in',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--color-accent-500)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Why this cart?
          </span>
        </div>
        <Badge variant="ai">
          {budgetLabel[reasoning.estimatedBudget] ?? reasoning.estimatedBudget}
        </Badge>
      </div>

      {/* Summary */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-9">
        {reasoning.summary}
      </p>

      {/* Key decisions */}
      {reasoning.keyDecisions.length > 0 && (
        <ul className="space-y-1.5 pl-9">
          {reasoning.keyDecisions.map((decision, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <span className="text-[var(--color-accent-500)] mt-0.5 flex-shrink-0">•</span>
              <span className="leading-relaxed">{decision}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
