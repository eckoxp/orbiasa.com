'use client';

import React from 'react';
import { AlertTriangle, X, XCircle } from 'lucide-react';

type Tone = 'error' | 'warning';

const tones: Record<Tone, { box: string; icon: string; title: string }> = {
  error: {
    box: 'border-red-500/20 border-s-4 border-s-red-500 bg-red-500/10',
    icon: 'bg-red-500/15 text-red-400',
    title: 'text-red-100',
  },
  warning: {
    box: 'border-amber-500/20 border-s-4 border-s-amber-500 bg-amber-500/10',
    icon: 'bg-amber-500/15 text-amber-400',
    title: 'text-amber-100',
  },
};

export default function Notice({
  tone = 'error',
  title,
  children,
  action,
  onClose,
  closeLabel = 'Close',
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}) {
  const style = tones[tone];
  const Icon = tone === 'error' ? XCircle : AlertTriangle;
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 ${style.box}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        {title && <div className={`font-bold leading-6 ${style.title}`}>{title}</div>}
        {children && <div className="text-sm leading-6 text-gray-300">{children}</div>}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label={closeLabel} className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}