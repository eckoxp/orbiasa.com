'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  text: string;
  speedMs?: number; // time per character
  startDelayMs?: number;
  className?: string;
  showCursor?: boolean;
};

export default function Typewriter({
  text,
  speedMs = 40,
  startDelayMs = 200,
  className,
  showCursor = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [cursorOn, setCursorOn] = useState(true);
  const startedRef = useRef(false);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    // Restart animation whenever text changes
    setIndex(0);
    startedRef.current = false;
  }, [text]);

  useEffect(() => {
    // Respect reduced motion
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setIndex(chars.length);
      return;
    }

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      startedRef.current = true;
      intervalId = window.setInterval(() => {
        setIndex((prev) => {
          if (prev >= chars.length) {
            if (intervalId) window.clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [chars.length, speedMs, startDelayMs]);

  useEffect(() => {
    if (!showCursor) return;
    const id = window.setInterval(() => setCursorOn((v) => !v), 500);
    return () => window.clearInterval(id);
  }, [showCursor]);

  const visible = chars.slice(0, index).join('');

  return (
    <span className={className} aria-label={text}>
      {visible}
      {showCursor && index < chars.length ? (
        <span style={{ opacity: cursorOn ? 1 : 0 }} className="inline-block w-[1px] -mb-1 align-middle h-[1em] bg-white ml-1" />
      ) : null}
    </span>
  );
}


