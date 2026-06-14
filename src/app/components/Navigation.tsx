'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCart } from '../providers/CartProvider';
import { useEffect, useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const { itemCount, computeTotal } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          'text-sm font-medium transition-colors duration-150',
          active
            ? 'text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
        ].join(' ')}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className={[
      'sticky top-0 z-50',
      'border-b border-[var(--border-default)]',
      'bg-[var(--surface-page)]/85 backdrop-blur-md',
      'transition-colors duration-200',
    ].join(' ')}>
      <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between gap-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          {/* Brand mark — Concept C: indigo tile · three amber signal dots · white bolt */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Indigo rounded-square tile */}
            <rect
              width="28"
              height="28"
              rx="7"
              fill="var(--color-accent-500)"
            />

            {/*
              Three amber signal dots — arc across upper third.
              Story: situation input (left) → AI processing (center) → action (right).
              Center dot is raised 1.5px to form a clear arc.
              r="2.2" keeps them prominent at 28px and favicon scale.
            */}
            <circle cx="8.5"  cy="9.5"  r="2.2" fill="var(--color-shop-400)" />
            <circle cx="14"   cy="7.8"  r="2.2" fill="var(--color-shop-400)" />
            <circle cx="19.5" cy="9.5"  r="2.2" fill="var(--color-shop-400)" />

            {/*
              White lightning bolt — occupies the lower 60% of the tile.
              Custom path: wider and more balanced than the Zap icon,
              reads as "action / speed" rather than "electricity".
              The top-right notch aligns under the right dot (→ action).
            */}
            <path
              d="M15.8 13H19L13.2 22V17H10L15.8 13Z"
              fill="white"
              strokeLinejoin="round"
            />
          </svg>

          <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">
            SwiftCart
          </span>
        </Link>

        {/* Delivery badge — visible on md+ */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success-surface)] border border-[var(--color-success-border)]">
          <Clock className="h-3 w-3 text-[var(--color-success-text)]" />
          <span className="text-xs font-medium text-[var(--color-success-text)]">
            10–15 min delivery
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLink('/', 'Home')}
          {navLink('/search', 'Browse')}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={[
              'h-9 w-9 rounded-lg flex items-center justify-center',
              'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--surface-raised)]',
              'border border-transparent hover:border-[var(--border-default)]',
              'transition-all duration-150',
            ].join(' ')}
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          {/* Cart button — amber accent */}
          <Link
            href="/cart"
            className={[
              'relative flex items-center gap-2 h-9 px-3 rounded-lg',
              'transition-all duration-150',
              itemCount > 0
                ? 'bg-[var(--color-shop-50)] border border-[var(--color-shop-200)] text-[var(--color-shop-600)] hover:bg-[var(--color-shop-100)]'
                : 'text-[var(--text-primary)] border border-transparent hover:bg-[var(--surface-raised)] hover:border-[var(--border-default)]',
            ].join(' ')}
          >
            <ShoppingCart className="h-4 w-4 flex-shrink-0" />

            {itemCount > 0 && (
              <>
                <span className={[
                  'absolute -top-1.5 -right-1.5',
                  'h-5 w-5 flex items-center justify-center',
                  'rounded-full text-[10px] font-bold text-white',
                  'bg-[var(--color-shop-500)]',
                  'animate-bounce-in',
                ].join(' ')}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
                <span className="hidden sm:inline text-sm font-semibold tabular-nums">
                  ₹{computeTotal().toLocaleString('en-IN')}
                </span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
