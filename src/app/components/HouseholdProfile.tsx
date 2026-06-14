'use client';

import { useState, useEffect } from 'react';
import type { HouseholdProfile } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Check, Users, Leaf, Wallet, Minus, Plus } from 'lucide-react';

const STORAGE_KEY = 'swiftcart_household_profile';

const defaultProfile: HouseholdProfile = {
  householdSize: 2,
  diet: 'non-vegetarian',
  budget: 'standard',
};

interface HouseholdProfileProps {
  onProfileChange: (profile: HouseholdProfile) => void;
}

const DIET_OPTIONS = [
  { value: 'non-vegetarian', label: 'Non-Veg',    emoji: '🍗' },
  { value: 'vegetarian',     label: 'Vegetarian', emoji: '🥬' },
  { value: 'vegan',          label: 'Vegan',      emoji: '🌱' },
];

const BUDGET_OPTIONS = [
  { value: 'budget',   label: 'Budget',   emoji: '💰', hint: 'Value picks' },
  { value: 'standard', label: 'Standard', emoji: '🏷️', hint: 'Everyday brands' },
  { value: 'premium',  label: 'Premium',  emoji: '💎', hint: 'Best quality' },
];

export function HouseholdProfilePanel({ onProfileChange }: HouseholdProfileProps) {
  const [profile, setProfile] = useState<HouseholdProfile>(defaultProfile);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as HouseholdProfile;
        setProfile(parsed);
        onProfileChange(parsed);
      } catch { /* use defaults */ }
    }
    setHasLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof HouseholdProfile, value: string | number) => {
    const next = { ...profile, [field]: value };
    setProfile(next);
    // auto-save on every change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    onProfileChange(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!hasLoaded) return null;

  return (
    <div className={[
      'rounded-xl border border-[var(--border-default)]',
      'bg-[var(--surface-raised)]',
      'p-5',
    ].join(' ')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--color-accent-500)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Household Preferences
          </span>
        </div>
        <span className={[
          'text-xs font-medium transition-all duration-300',
          saved ? 'text-[var(--color-success-text)] opacity-100' : 'opacity-0',
        ].join(' ')}>
          <Check className="h-3 w-3 inline mr-1" />Saved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* ── Family Size ── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <Users className="h-3 w-3" /> Family Size
          </label>
          <div className="flex items-center gap-0 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] overflow-hidden h-10">
            <button
              onClick={() => handleChange('householdSize', Math.max(1, profile.householdSize - 1))}
              className="h-full w-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors flex-shrink-0"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1 flex items-center justify-center border-x border-[var(--border-default)]">
              <span className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                {profile.householdSize}
              </span>
              <span className="text-xs text-[var(--text-muted)] ml-1">
                {profile.householdSize === 1 ? 'person' : 'people'}
              </span>
            </div>
            <button
              onClick={() => handleChange('householdSize', Math.min(10, profile.householdSize + 1))}
              className="h-full w-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors flex-shrink-0"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Diet Preference ── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <Leaf className="h-3 w-3" /> Diet
          </label>
          <div className="flex gap-1.5 h-10">
            {DIET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange('diet', opt.value)}
                className={[
                  'flex-1 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold',
                  'border transition-all duration-150',
                  profile.diet === opt.value
                    ? 'bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]'
                    : 'border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:border-[var(--color-accent-200)] hover:bg-[var(--color-accent-50)]',
                ].join(' ')}
              >
                <span>{opt.emoji}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Budget ── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <Wallet className="h-3 w-3" /> Budget
          </label>
          <div className="flex gap-1.5 h-10">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange('budget', opt.value)}
                title={opt.hint}
                className={[
                  'flex-1 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold',
                  'border transition-all duration-150',
                  profile.budget === opt.value
                    ? 'bg-[var(--color-shop-500)] text-white border-[var(--color-shop-500)]'
                    : 'border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:border-[var(--color-shop-200)] hover:bg-[var(--color-shop-50)]',
                ].join(' ')}
              >
                <span>{opt.emoji}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active summary line */}
      <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
        AI will tailor cart quantities and product choices for{' '}
        <span className="text-[var(--text-secondary)] font-medium">{profile.householdSize} {profile.householdSize === 1 ? 'person' : 'people'}</span>,{' '}
        <span className="text-[var(--text-secondary)] font-medium">{DIET_OPTIONS.find(d => d.value === profile.diet)?.label} diet</span>,{' '}
        <span className="text-[var(--text-secondary)] font-medium">{BUDGET_OPTIONS.find(b => b.value === profile.budget)?.label} budget</span>.
      </p>
    </div>
  );
}
