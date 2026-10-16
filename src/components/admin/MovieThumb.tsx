'use client';

import React from 'react';
import { Film } from 'lucide-react';

const youtubeId = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;

const isDirectFile = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || /blob\.vercel-storage\.com/.test(url);

export default function MovieThumb({
  url,
  thumbnail,
  className = '',
}: {
  url: string;
  thumbnail?: string | null;
  className?: string;
}) {
  if (thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumbnail} alt="" className={`object-cover ${className}`} />;
  }
  const yt = youtubeId(url);
  if (yt) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" className={`object-cover ${className}`} />;
  }
  if (isDirectFile(url)) {
    return <video src={`${url}#t=0.5`} preload="metadata" muted playsInline className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center bg-[#1B1020] text-white/40 ${className}`}>
      <Film className="h-8 w-8" />
    </div>
  );
}