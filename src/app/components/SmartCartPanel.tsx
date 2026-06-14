'use client';

import { SmartCartRecommendation } from '@/types/index';
import { RecommendationItem } from './RecommendationItem';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface SmartCartPanelProps {
  recommendations: SmartCartRecommendation[];
  onAdd: (recommendation: SmartCartRecommendation) => void;
  addedIds: Set<string>;
  title?: string;
}

export function SmartCartPanel({ recommendations, onAdd, addedIds, title }: SmartCartPanelProps) {
  if (recommendations.length === 0) return null;

  return (
    <div
      className={[
        'rounded-xl border border-[var(--color-ai-border)]',
        'bg-[var(--color-ai-surface)]',
        'p-5 space-y-3',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-[var(--color-ai-surface)] border border-[var(--color-ai-border)] flex items-center justify-center">
          <Brain className="h-3.5 w-3.5 text-[var(--color-ai-text)]" />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {title ?? 'Recommended for you'}
        </span>
        <Badge variant="ai" className="ml-auto">Based on your history</Badge>
      </div>

      <div className="space-y-1.5">
        {recommendations.map((rec) => (
          <RecommendationItem
            key={rec.id}
            recommendation={rec}
            onAdd={onAdd}
            isAdded={addedIds.has(rec.id)}
          />
        ))}
      </div>
    </div>
  );
}
