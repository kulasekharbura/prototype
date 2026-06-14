'use client';

import { SmartCartRecommendation } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';

interface RecommendationItemProps {
  recommendation: SmartCartRecommendation;
  onAdd: (recommendation: SmartCartRecommendation) => void;
  isAdded?: boolean;
}

export function RecommendationItem({ recommendation, onAdd, isAdded }: RecommendationItemProps) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-3 px-3 py-2.5',
        'rounded-lg border transition-all duration-150',
        isAdded
          ? 'border-[var(--color-success-border)] bg-[var(--color-success-surface)]'
          : 'border-[var(--border-default)] bg-[var(--surface-card)] hover:border-[var(--color-accent-200)] hover:bg-[var(--color-accent-50)]',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {recommendation.productName}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
          {recommendation.reason}
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
          ₹{recommendation.estimatedPrice}
        </span>
        <Button
          size="sm"
          variant={isAdded ? 'secondary' : 'default'}
          onClick={() => onAdd(recommendation)}
          disabled={isAdded}
          className={[
            'h-7 px-2.5 text-xs gap-1',
            isAdded ? 'text-[var(--color-success-text)] border-[var(--color-success-border)]' : '',
          ].join(' ')}
        >
          {isAdded ? (
            <><Check className="h-3 w-3" /> Added</>
          ) : (
            <><Plus className="h-3 w-3" /> Add</>
          )}
        </Button>
      </div>
    </div>
  );
}
