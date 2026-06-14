'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../providers/CartProvider';
import { ForgotSomething } from '../../components/ForgotSomething';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Package, Minus, Plus, X,
  ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { CartItem } from '@/types/index';
import cuid from 'cuid';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { items, computeTotal, itemCount, addItem, removeItem, updateQuantity, clearCart, journeyStartTime, cart } = useCart();

  // Freeze the elapsed time the moment this page first renders — never updates after
  const elapsedSeconds = useMemo(() => {
    if (!journeyStartTime) return null;
    return Math.round((Date.now() - journeyStartTime) / 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive a polished occasion label from parsed intent — never shows raw user input
  const intentLabel = useMemo(() => {
    const intent = cart?.parsedIntent;
    if (!intent) return null;
    const categoryEmoji: Record<string, string> = {
      recipe:      '🍳',
      event:       '🎉',
      restocking:  '🛒',
      emergency:   '🚨',
      snack:       '🍿',
      general:     '📦',
    };
    const emoji   = categoryEmoji[intent.intentCategory ?? 'general'] ?? '📦';
    const occasion = (intent.occasionType ?? 'general')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    const groupStr = intent.groupSize > 1 ? ` · ${intent.groupSize} people` : '';
    return `${emoji} ${occasion}${groupStr}`;
  }, [cart]);
  const [showForgot, setShowForgot]           = useState(true);
  const [addedAfterItems, setAddedAfterItems] = useState<CartItem[]>([]);
  const [orderFinalized, setOrderFinalized]   = useState(false);
  const [showFullCart, setShowFullCart]       = useState(false);

  const handleStartNew = () => { clearCart(); router.push('/'); };

  const handleConfirmOrder = () => {
    setOrderFinalized(true);
    setShowForgot(false);
  };

  const handleAddAfterItem = (name: string, price: number) => {
    const id = cuid();
    addItem({ productName: name, quantity: 1, estimatedPrice: price, reasoning: 'Added after order', category: 'Last Minute' });
    setAddedAfterItems(prev => [...prev, { id, productName: name, quantity: 1, estimatedPrice: price, reasoning: 'Added after order', category: 'Last Minute' }]);
  };

  const handleRemoveAfterItem = (id: string) => {
    removeItem(id);
    setAddedAfterItems(prev => prev.filter(i => i.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    setAddedAfterItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const afterTotal = addedAfterItems.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-5">

      {/* ── Success card ── */}
      <div className={[
        'rounded-2xl border-2 border-[var(--color-success-border)]',
        'bg-[var(--color-success-surface)]',
        'p-8 text-center',
        'animate-fade-in',
      ].join(' ')}>
        <div className="animate-bounce-in inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-success-text)]/10 mb-4">
          <CheckCircle2 className="h-9 w-9 text-[var(--color-success-text)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          {orderFinalized ? 'Order confirmed!' : 'Order placed!'}
        </h1>

        {/* Polished intent badge — replaces raw user-input text */}
        {intentLabel && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 mb-4 rounded-full text-sm font-medium bg-[var(--color-success-text)]/10 text-[var(--color-success-text)]">
            {intentLabel}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 my-5">
          <div>
            <p className="text-2xl font-bold text-[var(--price-strong)] tabular-nums">
              ₹{computeTotal().toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">Total</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-default)]" />
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{itemCount}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">Items</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-default)]" />
          <div>
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-[var(--color-success-text)]" />
              <p className="text-lg font-bold text-[var(--color-success-text)]">~12</p>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">Minutes</p>
          </div>

          {/* Journey timer — only shown when we have a recorded start time */}
          {elapsedSeconds !== null && (
            <>
              <div className="w-px h-10 bg-[var(--border-default)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--color-success-text)] tabular-nums">
                  {elapsedSeconds}s
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">
                  Cart built in
                </p>
              </div>
            </>
          )}
        </div>

        {/* Learning signal */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-success-text)] mb-6">
          <Package className="h-3.5 w-3.5" />
          <span>Preferences saved for smarter recommendations next time</span>
        </div>

        <Button variant="outline" onClick={handleStartNew}>
          Start new order
        </Button>
      </div>

      {/* ── Forgot Something — hero placement ── */}
      {showForgot && !orderFinalized && (
        <ForgotSomething
          onAddItem={handleAddAfterItem}
          onFinalize={() => setShowForgot(false)}
        />
      )}

      {/* ── Added-after items review ── */}
      {addedAfterItems.length > 0 && !orderFinalized && (
        <div className={[
          'rounded-xl border border-[var(--color-shop-200)]',
          'bg-[var(--color-shop-50)] p-5',
          'animate-fade-in',
        ].join(' ')}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Added to order
              <span className="ml-2 text-xs text-[var(--text-muted)] font-normal">
                {addedAfterItems.length} item{addedAfterItems.length !== 1 ? 's' : ''}
              </span>
            </p>
            <span className="text-sm font-bold text-[var(--price-color)] tabular-nums">
              +₹{afterTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1">
            {addedAfterItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 border-b border-[var(--border-default)] last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] tabular-nums">
                    ₹{item.estimatedPrice} each
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-2.5 text-sm font-semibold text-[var(--text-primary)] min-w-[2rem] text-center tabular-nums border-x border-[var(--border-default)]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <span className="text-sm font-bold text-[var(--price-color)] tabular-nums min-w-[3rem] text-right">
                  ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                </span>

                <button
                  onClick={() => handleRemoveAfterItem(item.id)}
                  className="h-7 w-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--color-error-text)] hover:bg-[var(--color-error-surface)] transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="shop"
            size="lg"
            className="w-full mt-4 font-semibold"
            onClick={handleConfirmOrder}
          >
            Confirm updated order · ₹{computeTotal().toLocaleString('en-IN')}
          </Button>
        </div>
      )}

      {/* ── Finalize CTA (when forgot-something is showing but no additions yet) ── */}
      {showForgot && !orderFinalized && addedAfterItems.length === 0 && (
        <Button
          variant="shop"
          size="lg"
          className="w-full font-semibold"
          onClick={handleConfirmOrder}
        >
          Confirm &amp; finalize order
        </Button>
      )}

      {/* ── Collapsible full order ── */}
      <div className={[
        'rounded-xl border border-[var(--border-default)]',
        'bg-[var(--surface-card)] overflow-hidden',
      ].join(' ')}>
        <button
          onClick={() => setShowFullCart(!showFullCart)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-raised)] transition-colors"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">
            View complete order · {itemCount} items · ₹{computeTotal().toLocaleString('en-IN')}
          </span>
          {showFullCart
            ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
            : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
          }
        </button>
        {showFullCart && (
          <div className="border-t border-[var(--border-default)] px-5 py-3 max-h-72 overflow-y-auto space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">{item.productName}</p>
                  <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums ml-3">
                  ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-[var(--border-default)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">Order total</span>
              <span className="text-base font-bold text-[var(--price-strong)] tabular-nums">
                ₹{computeTotal().toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Finalized confirmation ── */}
      {orderFinalized && (
        <div className={[
          'rounded-xl border-2 border-[var(--color-success-border)]',
          'bg-[var(--color-success-surface)] p-5 text-center',
          'animate-fade-in',
        ].join(' ')}>
          <CheckCircle2 className="h-7 w-7 text-[var(--color-success-text)] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[var(--color-success-text)]">
            Order finalized
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 tabular-nums">
            ₹{computeTotal().toLocaleString('en-IN')} · {itemCount} items · arriving in ~12 min
          </p>
        </div>
      )}
    </div>
  );
}
