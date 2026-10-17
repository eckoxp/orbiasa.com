'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

type Props = {
  text: string;
  speedMs?: number; // time per character
  startDelayMs?: number;
  className?: string;
  showCursor?: boolean;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

function TypewriterInner({
  text,
  speedMs = 40,
  startDelayMs = 200,
  className,
  showCursor = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [cursorOn, setCursorOn] = useState(true);
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    // With reduced motion the full text is shown right away (see `shown` below).
    if (reduced) return;

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
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
  }, [reduced, chars.length, speedMs, startDelayMs]);

  useEffect(() => {
    if (!showCursor) return;
    const id = window.setInterval(() => setCursorOn((v) => !v), 500);
    return () => window.clearInterval(id);
  }, [showCursor]);

  const shown = reduced ? chars.length : index;
  const visible = chars.slice(0, shown).join('');

  return (
    <span className={className} aria-label={text}>
      {visible}
      {showCursor && shown < chars.length ? (
        <span style={{ opacity: cursorOn ? 1 : 0 }} className="inline-block w-[1px] -mb-1 align-middle h-[1em] bg-white ml-1" />
      ) : null}
    </span>
  );
}

// `key={text}` remounts the inner component when the text changes, which restarts
// the animation without resetting state inside an effect.
export default function Typewriter(props: Props) {
  return <TypewriterInner key={props.text} {...props} />;
}