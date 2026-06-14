'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Check } from 'lucide-react';
import { Product } from '@/types/index';

const QUICK_ADDS = [
  { name: 'Bread',        price: 45  },
  { name: 'Milk 500ml',   price: 30  },
  { name: 'Eggs (6 Pack)',price: 50  },
  { name: 'Toothpaste',   price: 110 },
  { name: 'Butter 100g',  price: 55  },
  { name: 'Bananas 6pc',  price: 40  },
];

const TOTAL_SECONDS = 120;

interface ForgotSomethingProps {
  onAddItem:  (name: string, price: number) => void;
  onFinalize: () => void;
}

export function ForgotSomething({ onAddItem, onFinalize }: ForgotSomethingProps) {
  const [timeLeft, setTimeLeft]         = useState(TOTAL_SECONDS);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [addedItems, setAddedItems]     = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => onFinalize(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [onFinalize]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res  = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.products.slice(0, 5));
    } catch { /* ignore */ }
  };

  const handleAdd = (name: string, price: number) => {
    onAddItem(name, price);
    setAddedItems(prev => new Set([...prev, name]));
  };

  if (timeLeft === 0) return null;

  const mm  = Math.floor(timeLeft / 60);
  const ss  = timeLeft % 60;
  const pct = (timeLeft / TOTAL_SECONDS) * 100;

  // Colour shifts amber → red as time runs low
  const urgent     = timeLeft <= 30;
  const ringColor  = urgent ? 'var(--color-error-text)'   : 'var(--color-shop-500)';
  const textColor  = urgent ? 'var(--color-error-text)'   : 'var(--color-shop-600)';
  const surfaceBg  = urgent ? 'var(--color-error-surface)': 'var(--color-shop-50)';
  const surfaceBdr = urgent ? 'var(--color-error-border)' : 'var(--color-shop-200)';

  // SVG ring
  const R          = 28;
  const CIRC       = 2 * Math.PI * R;
  const dash       = (pct / 100) * CIRC;

  return (
    <div
      className="rounded-2xl border p-5 space-y-5 animate-fade-in transition-colors duration-500"
      style={{ background: `var(${surfaceBg.replace('var(','').replace(')','')})`, borderColor: `var(${surfaceBdr.replace('var(','').replace(')','')})` }}
    >
      {/* ── Header: countdown as hero ── */}
      <div className="flex items-center gap-4">
        {/* SVG ring countdown */}
        <div className="relative flex-shrink-0 h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            {/* Track */}
            <circle cx="32" cy="32" r={R} fill="none" strokeWidth="4"
              stroke="var(--border-default)" />
            {/* Progress */}
            <circle cx="32" cy="32" r={R} fill="none" strokeWidth="4"
              stroke={ringColor}
              strokeDasharray={`${dash} ${CIRC}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums leading-none" style={{ color: textColor }}>
              {mm}:{ss.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div>
          <p className="text-base font-bold text-[var(--text-primary)]">
            Forgot something?
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Add items to your order before it's dispatched.
          </p>
          {urgent && (
            <p className="text-xs font-semibold text-[var(--color-error-text)] mt-1 animate-pulse">
              Hurry — order finalises soon!
            </p>
          )}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search to add a product…"
            className={[
              'w-full pl-9 pr-4 py-2.5 rounded-lg text-sm',
              'border border-[var(--border-default)] bg-[var(--surface-card)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--border-focus)]',
              'transition-all duration-150',
            ].join(' ')}
          />
        </div>
        <Button size="sm" variant="outline" onClick={handleSearch} className="px-4">
          Search
        </Button>
      </div>

      {/* ── Search results ── */}
      {searchResults.length > 0 && (
        <div className="space-y-1.5">
          {searchResults.map((p) => (
            <div
              key={p.id}
              className={[
                'flex items-center justify-between px-3 py-2.5 rounded-lg',
                'border border-[var(--border-default)] bg-[var(--surface-card)]',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                <p className="text-xs text-[var(--price-color)] font-semibold tabular-nums">₹{p.price}</p>
              </div>
              <Button
                size="sm"
                variant={addedItems.has(p.name) ? 'secondary' : 'shop'}
                disabled={addedItems.has(p.name)}
                onClick={() => handleAdd(p.name, p.price)}
                className="h-7 px-3 text-xs gap-1 flex-shrink-0 ml-3"
              >
                {addedItems.has(p.name)
                  ? <><Check className="h-3 w-3" /> Added</>
                  : <><Plus className="h-3 w-3" /> Add</>
                }
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick adds ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADDS.map((item) => {
            const added = addedItems.has(item.name);
            return (
              <button
                key={item.name}
                onClick={() => handleAdd(item.name, item.price)}
                disabled={added}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border',
                  'font-medium transition-all duration-150',
                  added
                    ? 'bg-[var(--color-success-surface)] text-[var(--color-success-text)] border-[var(--color-success-border)]'
                    : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--color-shop-400)] hover:bg-[var(--color-shop-50)]',
                ].join(' ')}
              >
                {added
                  ? <><Check className="h-3.5 w-3.5" /> {item.name}</>
                  : <><Plus className="h-3.5 w-3.5" /> {item.name} · <span className="tabular-nums text-[var(--price-color)]">₹{item.price}</span></>
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
