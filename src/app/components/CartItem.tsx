'use client';

import { useState } from 'react';
import { CartItem as CartItemType } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getAlternatives } from '@/services/alternatives';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSwap?: (id: string, newName: string, newPrice: number) => void;
}

export function CartItem({ item, onQuantityChange, onRemove, onSwap }: CartItemProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const alternatives = getAlternatives(item.productName);

  return (
    <div
      className={[
        'group py-4 border-b border-[var(--border-default)] last:border-b-0',
        'transition-colors duration-100',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
            {item.productName}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed line-clamp-1">
            {item.reasoning}
          </p>
          {alternatives.length > 0 && (
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex items-center gap-1 text-xs text-[var(--text-link)] hover:text-[var(--color-accent-600)] mt-1.5 transition-colors"
            >
              {showAlternatives ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <span>{showAlternatives ? 'Hide alternatives' : 'See alternatives'}</span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-lg border border-[var(--border-default)] overflow-hidden bg-[var(--surface-raised)]">
            <button
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label={`Decrease quantity of ${item.productName}`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2.5 text-sm font-medium text-[var(--text-primary)] min-w-[2rem] text-center tabular-nums border-x border-[var(--border-default)]">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label={`Increase quantity of ${item.productName}`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[3.5rem] text-right tabular-nums">
            ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
          </span>

          {/* Remove */}
          <button
            onClick={() => onRemove(item.id)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--color-error-text)] hover:bg-[var(--color-error-surface)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-150"
            aria-label={`Remove ${item.productName}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Alternatives drawer */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="mt-3 ml-0 pl-3 border-l-2 border-[var(--color-accent-200)] space-y-1.5 animate-fade-in">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Alternatives
          </p>
          {alternatives.map((alt, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1">
              <span className="text-[var(--text-secondary)] flex-1 min-w-0 truncate">{alt.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{alt.type}</Badge>
                <span className="text-[var(--text-primary)] font-medium tabular-nums">₹{alt.price}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2"
                  onClick={() => {
                    onSwap?.(item.id, alt.name, alt.price);
                    setShowAlternatives(false);
                  }}
                >
                  Swap
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
