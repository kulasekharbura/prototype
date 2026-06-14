'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, History, Clock } from 'lucide-react';

interface SessionSummary {
  id: string;
  description: string;
  createdAt: string;
  itemCount: number;
  totalCost: number;
}

interface SessionHistoryProps {
  userId: string | null;
}

function getRelativeTime(dateStr: string): string {
  const now      = new Date();
  const date     = new Date(dateStr);
  const diffMs   = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs  = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function SessionHistory({ userId }: SessionHistoryProps) {
  const [sessions, setSessions]   = useState<SessionSummary[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`/api/sessions/${userId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setSessions(data.sessions.slice(0, 5)); })
      .catch(() => {})
      .finally(() => { setIsLoading(false); setHasFetched(true); });
  }, [userId]);

  if (!userId || !hasFetched || sessions.length === 0) return null;

  return (
    <div className={[
      'rounded-xl border border-[var(--border-default)]',
      'bg-[var(--surface-card)] overflow-hidden',
    ].join(' ')}>
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-raised)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <History className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Recent orders</span>
          <Badge variant="secondary">{sessions.length}</Badge>
        </div>
        <ChevronDown
          className={[
            'h-4 w-4 text-[var(--text-muted)] transition-transform duration-200',
            isExpanded ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Session list */}
      {isExpanded && (
        <div className="border-t border-[var(--border-default)] divide-y divide-[var(--border-default)]">
          {isLoading ? (
            <div className="px-5 py-4 text-sm text-[var(--text-muted)]">Loading…</div>
          ) : sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[var(--surface-raised)] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {session.description}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)]">
                    {getRelativeTime(session.createdAt)} · {session.itemCount} item{session.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[var(--price-color)] tabular-nums flex-shrink-0">
                ₹{session.totalCost.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
