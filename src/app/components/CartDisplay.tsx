'use client';

import { CartItem as CartItemType } from '@/types/index';
import { CartItem } from './CartItem';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CartDisplayProps {
  items: CartItemType[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSwap?: (id: string, newName: string, newPrice: number) => void;
  intentLabels?: string[];
}

export function CartDisplay({ items, onQuantityChange, onRemove, onSwap, intentLabels }: CartDisplayProps) {
  const groupedItems = items.reduce<Record<string, CartItemType[]>>((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedItems);

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-[var(--text-muted)]">No items in cart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Multi-intent labels */}
      {intentLabels && intentLabels.length > 1 && (
        <div
          className={[
            'rounded-xl border border-[var(--color-ai-border)]',
            'bg-[var(--color-ai-surface)]',
            'px-4 py-3 mb-4',
          ].join(' ')}
        >
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Detected intents
          </p>
          <div className="flex flex-wrap gap-1.5">
            {intentLabels.map((label, idx) => (
              <Badge key={idx} variant="ai">{label}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category groups */}
      {categories.map((category) => (
        <Card key={category} className="overflow-hidden">
          {/* Category header */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {category}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              ({groupedItems[category].length})
            </span>
          </div>
          <CardContent className="px-5 pb-2 pt-0">
            {groupedItems[category].map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
                onSwap={onSwap}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
