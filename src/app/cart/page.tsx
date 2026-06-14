'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../providers/CartProvider';
import { CartDisplay } from '../components/CartDisplay';
import { AIReasoningPanel } from '../components/AIReasoningPanel';
import { SmartCartPanel } from '../components/SmartCartPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, ShoppingCart, Clock, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SmartCartRecommendation } from '@/types/index';

export default function CartPage() {
  const router = useRouter();
  const {
    items, cart, intentLabels,
    updateQuantity, removeItem, swapItem,
    computeTotal, itemCount, userId, addItem,
  } = useCart();
  const [recommendations, setRecommendations] = useState<SmartCartRecommendation[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const category = cart?.parsedIntent?.intentCategory;
    const params = category ? `?category=${category}` : '';
    fetch(`/api/smart-cart/${userId}${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.eligible) setRecommendations(data.recommendations);
      })
      .catch(() => {});
  }, [userId, cart]);

  const handleAddRecommendation = (rec: SmartCartRecommendation) => {
    addItem({
      productName: rec.productName,
      quantity: rec.quantity,
      estimatedPrice: rec.estimatedPrice,
      reasoning: rec.reason,
      category: 'Recommended',
    });
    setAddedIds(prev => new Set([...prev, rec.id]));
  };

  const subtotal     = computeTotal();
  const deliveryFee  = subtotal > 499 ? 0 : 30;
  const total        = subtotal + deliveryFee;

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-default)] mb-5">
          <ShoppingBag className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your cart is empty</h2>
        <p className="text-[var(--text-muted)] mb-8 text-sm leading-relaxed">
          Describe a situation on the home page and AI will fill your cart instantly.
        </p>
        <Button variant="shop" size="lg" onClick={() => router.push('/')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-7">

      {/* Back link */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 text-sm text-[var(--text-link)] hover:text-[var(--text-link-hover)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </button>

      {/* Page title */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-5 w-5 text-[var(--color-shop-500)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Shopping Cart
          </h1>
        </div>
        <span className="text-sm text-[var(--text-muted)] font-medium">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* 1 ── Intent / Occasion — CartDisplay receives intentLabels and renders them at the top */}
      {/* 2 ── Cart items (intentLabels prop drives the intent header inside CartDisplay) */}
      <CartDisplay
        items={items}
        onQuantityChange={updateQuantity}
        onRemove={removeItem}
        onSwap={swapItem}
        intentLabels={intentLabels}
      />

      {/* 3 ── AI Reasoning — explains why this cart was built */}
      {cart?.cartReasoning && (
        <div className="mt-6">
          <AIReasoningPanel reasoning={cart.cartReasoning} />
        </div>
      )}

      {/* 4 ── Smart Recommendations — suggests additions based on history */}
      {recommendations.length > 0 && (
        <div className="mt-6">
          <SmartCartPanel
            recommendations={recommendations}
            onAdd={handleAddRecommendation}
            addedIds={addedIds}
            title="Recommended for you"
          />
        </div>
      )}

      {/* 5 ── Order summary + CTA — sticky bar */}
      <div className={[
        'mt-6 sticky bottom-4 z-10',
        'rounded-2xl border border-[var(--border-default)]',
        'bg-[var(--surface-card)] shadow-[var(--shadow-lg)]',
        'overflow-hidden',
      ].join(' ')}>

        {/* Delivery notice strip */}
        <div className={[
          'flex items-center justify-between px-5 py-2.5',
          'bg-[var(--color-success-surface)] border-b border-[var(--color-success-border)]',
        ].join(' ')}>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
            <span className="text-xs font-medium text-[var(--color-success-text)]">
              Estimated delivery: 10–15 minutes
            </span>
          </div>
          {deliveryFee === 0 ? (
            <span className="text-xs font-semibold text-[var(--color-success-text)]">
              Free delivery ✓
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              Add ₹{(499 - subtotal).toFixed(0)} more for free delivery
            </span>
          )}
        </div>

        {/* Price + actions */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium mb-0.5">
              Order total
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--price-strong)] tabular-nums">
                ₹{total.toLocaleString('en-IN')}
              </span>
              {deliveryFee > 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  incl. ₹{deliveryFee} delivery
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1 sm:flex-none gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add more
            </Button>
            <Button
              variant="shop"
              size="lg"
              onClick={() => router.push('/checkout')}
              className="flex-1 sm:flex-none font-semibold"
            >
              Proceed to Checkout →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
