'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SituationInput } from './components/SituationInput';
import { VoiceButton } from './components/VoiceButton';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { HouseholdProfilePanel } from './components/HouseholdProfile';
import { SessionHistory } from './components/SessionHistory';
import { ProductCatalog } from './components/ProductCatalog';
import { useCart } from './providers/CartProvider';
import { Product } from '@/types/index';
import { Sparkles, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const {
    addItem, setCart, setItems, setIntentLabels, setLastDescription,
    userId, householdProfile, setHouseholdProfile, items,
    intentLabels: existingLabels, setJourneyStartTime,
  } = useCart();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartItemNames = new Set(items.map(i => i.productName.toLowerCase()));

  const handleSubmit = async (description: string) => {
    setIsLoading(true);
    setError(null);
    setLastDescription(description);
    setJourneyStartTime(Date.now()); // ← start the journey clock

    try {
      const additionalContext: Record<string, unknown> = {};
      if (householdProfile) {
        additionalContext.householdSize = householdProfile.householdSize;
        additionalContext.diet = householdProfile.diet;
        additionalContext.budget = householdProfile.budget;
      }

      const res = await fetch('/api/generate-multi-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          additionalContext: Object.keys(additionalContext).length > 0 ? additionalContext : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate cart');

      setCart(data.cart);

      const newItems = data.cart.items;
      if (items.length > 0) {
        const merged = [...items];
        for (const newItem of newItems) {
          const existingIndex = merged.findIndex(
            i => i.productName.toLowerCase() === newItem.productName.toLowerCase()
          );
          if (existingIndex >= 0) {
            merged[existingIndex] = {
              ...merged[existingIndex],
              quantity: merged[existingIndex].quantity + newItem.quantity,
            };
          } else {
            merged.push(newItem);
          }
        }
        setItems(merged);
      } else {
        setItems(newItems);
      }

      const newLabels = data.intentLabels || [];
      const combinedLabels = [...existingLabels, ...newLabels.filter((l: string) => !existingLabels.includes(l))];
      setIntentLabels(combinedLabels);

      router.push('/cart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    addItem({
      productName: product.name,
      quantity: 1,
      estimatedPrice: product.price,
      reasoning: 'Manually added',
      category: product.category,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-14">

      {/* ── AI Hero ── */}
      <section>
        {/* Top label */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent-50)] flex items-center justify-center border border-[var(--color-accent-200)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent-500)]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            AI Shopping Assistant
          </span>
        </div>

        {/* Hero card */}
        <div className={[
          'rounded-2xl border border-[var(--border-default)]',
          'bg-[var(--surface-card)] shadow-[var(--shadow-md)]',
          'p-7 md:p-10',
          'space-y-7',
        ].join(' ')}>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Describe any situation.
              <br />
              <span className="text-[var(--color-accent-500)]">Get a complete cart instantly.</span>
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-xl">
              Tell us what&apos;s happening — a dinner party, a camping trip, a recipe you&apos;re cooking — and AI assembles the perfect cart in seconds.
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-success-text)]">
              <Clock className="h-4 w-4" />
              <span className="font-medium">10–15 min delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-success-text)]" />
              <span>Free delivery over ₹499</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <Zap className="h-4 w-4 text-[var(--color-shop-500)]" />
              <span>AI-curated, every time</span>
            </div>
          </div>

          {/* Household profile */}
          <HouseholdProfilePanel onProfileChange={setHouseholdProfile} />

          {/* Error */}
          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => { if (inputValue) handleSubmit(inputValue); }}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Input + voice */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <SituationInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                value={inputValue}
                onChange={setInputValue}
              />
            </div>
            <div className="pt-1">
              <VoiceButton onTranscription={setInputValue} disabled={isLoading} />
            </div>
          </div>
        </div>

        {/* Loading — below hero */}
        {isLoading && (
          <div className="mt-6">
            <LoadingState />
          </div>
        )}
      </section>

      {/* ── Divider ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-widest">
          or browse products
        </span>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      {/* ── Product catalog ── */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Browse Products
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Add items directly to your cart
            </p>
          </div>
        </div>
        <ProductCatalog onAddToCart={handleAddProduct} cartItemNames={cartItemNames} />
      </section>

      {/* ── Session history ── */}
      <section>
        <SessionHistory userId={userId} />
      </section>
    </div>
  );
}
