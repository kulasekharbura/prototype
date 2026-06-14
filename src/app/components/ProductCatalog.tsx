'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Check, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/index';

const CATEGORIES = [
  { name: 'All',           emoji: '🏪' },
  { name: 'Food & Drinks', emoji: '🥛' },
  { name: 'Snacks',        emoji: '🍪' },
  { name: 'Beverages',     emoji: '🥤' },
  { name: 'Household',     emoji: '🧹' },
  { name: 'Personal Care', emoji: '🧴' },
  { name: 'Supplies',      emoji: '📦' },
  { name: 'Entertainment', emoji: '🎮' },
];

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  cartItemNames: Set<string>;
}

export function ProductCatalog({ onAddToCart, cartItemNames }: ProductCatalogProps) {
  const [products, setProducts]               = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery]           = useState('');
  const [isLoading, setIsLoading]               = useState(false);

  const fetchProducts = async (category?: string, search?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res  = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch { /* silently fail */ } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch  = () => fetchProducts(selectedCategory, searchQuery);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="w-full space-y-5">

      {/* Search row */}
      <div className="flex gap-2.5">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products…"
            className={[
              'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm',
              'border border-[var(--border-default)] bg-[var(--surface-page)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--border-focus)]',
              'focus:ring-2 focus:ring-[var(--color-accent-500)]/15',
              'transition-all duration-150',
            ].join(' ')}
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="px-5">
          Search
        </Button>
      </div>

      {/* Category chips — bigger, commerce-style */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={[
                'px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150',
                active
                  ? 'bg-[var(--color-neutral-900)] text-[var(--color-neutral-0)] border-[var(--color-neutral-900)]'
                  : [
                      'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-default)]',
                      'hover:border-[var(--color-shop-400)] hover:text-[var(--color-shop-600)]',
                      'hover:bg-[var(--color-shop-50)]',
                    ].join(' '),
              ].join(' ')}
            >
              <span className="mr-1.5">{cat.emoji}</span>{cat.name}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      {isLoading ? (
        /* Skeleton grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4 space-y-3"
            >
              <div className="h-4 w-2/3 rounded skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 w-16 rounded skeleton-shimmer" />
                <div className="h-8 w-16 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">No products found</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const inCart = cartItemNames.has(product.name.toLowerCase());
            return (
              <ProductCard
                key={product.id}
                product={product}
                inCart={inCart}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Product card — commerce feel ── */
function ProductCard({
  product,
  inCart,
  onAddToCart,
}: {
  product: Product;
  inCart: boolean;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <div
      className={[
        'group rounded-xl border transition-all duration-150',
        'bg-[var(--surface-card)]',
        inCart
          ? 'border-[var(--color-success-border)] bg-[var(--color-success-surface)]'
          : 'border-[var(--border-default)] hover:border-[var(--color-shop-200)] hover:shadow-[var(--shadow-md)]',
      ].join(' ')}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Category tag */}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {product.category}
        </span>

        {/* Name + description */}
        <div className="flex-1">
          <p className={[
            'text-sm font-semibold leading-snug',
            inCart ? 'text-[var(--color-success-text)]' : 'text-[var(--text-primary)]',
          ].join(' ')}>
            {product.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price + CTA row */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--border-default)]">
          <div>
            <span className={[
              'text-lg font-bold tabular-nums',
              inCart ? 'text-[var(--color-success-text)]' : 'text-[var(--price-color)]',
            ].join(' ')}>
              ₹{product.price}
            </span>
          </div>
          <Button
            size="sm"
            variant={inCart ? 'secondary' : 'shop'}
            onClick={() => !inCart && onAddToCart(product)}
            disabled={inCart}
            className="gap-1.5 flex-shrink-0 h-9 px-4 text-sm"
          >
            {inCart ? (
              <><Check className="h-3.5 w-3.5" /> Added</>
            ) : (
              <><Plus className="h-3.5 w-3.5" /> Add</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
