'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../providers/CartProvider';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, computeTotal, itemCount, lastDescription, userId, setUserId, cart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal    = computeTotal();
  const deliveryFee = subtotal > 499 ? 0 : 30;
  const total       = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0) router.push('/cart');
  }, [items.length, router]);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || undefined,
          description: lastDescription || 'Manual order',
          parsedIntent: cart?.parsedIntent || {
            occasionType: 'manual', groupSize: 1,
            constraints: [], preferences: [],
            rawDescription: lastDescription || 'Manual order',
          },
          approvedItems: items,
        }),
      });
      const data = await res.json();
      if (data.userId) setUserId(data.userId);
      router.push('/order/success');
    } catch {
      router.push('/order/success');
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-7">

      {/* Back */}
      <button
        onClick={() => router.push('/cart')}
        className="flex items-center gap-1.5 text-sm text-[var(--text-link)] hover:text-[var(--text-link-hover)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </button>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-7">
        Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* ── Left column ── */}
        <div className="md:col-span-3 space-y-4">

          {/* Delivery info */}
          <div className={[
            'rounded-xl border border-[var(--border-default)]',
            'bg-[var(--surface-card)] p-5',
          ].join(' ')}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-[var(--color-shop-500)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Delivery address</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">123 Demo Street, Bangalore 560001</p>

            <div className={[
              'flex items-center gap-2 mt-3 px-3 py-2 rounded-lg',
              'bg-[var(--color-success-surface)] border border-[var(--color-success-border)]',
            ].join(' ')}>
              <Clock className="h-3.5 w-3.5 text-[var(--color-success-text)] flex-shrink-0" />
              <span className="text-sm font-semibold text-[var(--color-success-text)]">
                Delivery in 10–15 minutes
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className={[
            'rounded-xl border border-[var(--border-default)]',
            'bg-[var(--surface-card)] p-5',
          ].join(' ')}>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-[var(--color-shop-500)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Payment</h3>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-success-text)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Cash on Delivery</span>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
            <span className="text-xs text-[var(--text-muted)]">
              Secure checkout · Your data is never shared
            </span>
          </div>
        </div>

        {/* ── Right column: order summary ── */}
        <div className="md:col-span-2">
          <div className={[
            'rounded-xl border border-[var(--border-default)]',
            'bg-[var(--surface-card)] overflow-hidden',
            'sticky top-20',
          ].join(' ')}>

            {/* Summary header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Order summary
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Items list */}
            <div className="px-5 py-3 max-h-52 overflow-y-auto space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                  <span className="text-[var(--text-secondary)] flex-1 leading-snug">
                    {item.productName}
                    <span className="text-[var(--text-muted)]"> ×{item.quantity}</span>
                  </span>
                  <span className="text-[var(--text-primary)] font-medium tabular-nums flex-shrink-0">
                    ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-[var(--border-default)] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Subtotal</span>
                <span className="text-[var(--text-primary)] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Delivery</span>
                {deliveryFee === 0 ? (
                  <span className="text-[var(--color-success-text)] font-semibold">FREE</span>
                ) : (
                  <span className="text-[var(--text-primary)] tabular-nums">₹{deliveryFee}</span>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-[var(--border-default)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Total</span>
                <span className="text-2xl font-bold text-[var(--price-strong)] tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
              <Button
                variant="shop"
                size="lg"
                className="w-full text-base font-bold gap-2"
                onClick={handlePlaceOrder}
                disabled={isPlacing}
              >
                {isPlacing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</>
                ) : (
                  <>Place Order · ₹{total.toLocaleString('en-IN')}</>
                )}
              </Button>
              <p className="text-xs text-[var(--text-muted)] text-center mt-2.5">
                Delivered to your door in 10–15 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
