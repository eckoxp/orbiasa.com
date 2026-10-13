'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
  y?: number;
  durationMs?: number;
  delayMs?: number;
  className?: string;
};

export default function ScrollReveal({
  children,
  y = 12,
  durationMs = 380,
  delayMs = 0,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current as HTMLDivElement | null;
    if (!el) return;

    const initial = `opacity-0 translate-y-[${y}px]`;
    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;
    el.style.transition = `opacity ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const t = setTimeout(() => {
              if (!el) return;
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delayMs);
            observer.unobserve(entry.target);
            return () => clearTimeout(t);
          }
        });
      },
      { threshold: 0.03, rootMargin: '0px 0px 140px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [y, durationMs, delayMs]);

  return <div ref={ref} className={className}>{children}</div>;
}


