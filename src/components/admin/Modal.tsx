'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function Modal({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#25252F] bg-[#14141B]">
        <div className="flex items-center justify-between border-b border-[#25252F] p-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label={closeLabel} className="rounded-lg p-2 hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}