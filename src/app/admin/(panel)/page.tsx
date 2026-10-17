'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MovieRow, PhotoRow } from '@/lib/db';
import { Film, Image as ImageIcon, Mail } from 'lucide-react';
import MovieThumb from '@/components/admin/MovieThumb';
import StorageMeter from '@/components/admin/StorageMeter';
import { panelCls, chipCls } from '@/components/admin/ui';

interface Category {
  slug: string;
  name_ar: string;
  name_en: string;
}

interface Message {
  id: number;
  name: string;
  company: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function SectionHead({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-[#F08A97] hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { isRTL } = useLanguage();
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [movieCats, setMovieCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const urls = ['/api/admin/movies', '/api/admin/photos', '/api/admin/messages', '/api/admin/categories'];
        const responses = await Promise.all(urls.map((u) => fetch(u)));
        const [m, p, msg, c] = await Promise.all(responses.map((r) => r.json().catch(() => null)));
        if (cancelled) return;
        setMovies(Array.isArray(m) ? m : []);
        setPhotos(Array.isArray(p) ? p : []);
        setMessages(Array.isArray(msg) ? msg : []);
        setMovieCats(Array.isArray(c?.movies) ? c.movies : []);
        setError(!responses[0].ok || !responses[1].ok);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = messages.filter((m) => !m.is_read).length;
  const catName = (slug: string) => {
    const c = movieCats.find((x) => x.slug === slug);
    return c ? (isRTL ? c.name_ar : c.name_en) : slug;
  };

  const stats = [
    { href: '/admin/movies', icon: Film, label: isRTL ? 'الأفلام' : 'Movies', value: movies.length },
    { href: '/admin/photos', icon: ImageIcon, label: isRTL ? 'الصور' : 'Photos', value: photos.length },
    { href: '/admin/messages', icon: Mail, label: isRTL ? 'رسائل جديدة' : 'New messages', value: unread },
  ];

  return (
    <div className="space-y-7 px-4 py-6 sm:px-8 sm:py-8">
      <header>
        <h1 className="text-3xl font-bold">{isRTL ? 'نظرة عامة' : 'Overview'}</h1>
        <p className="mt-1 text-sm text-gray-400">{isRTL ? 'ملخص المحتوى والرسائل' : 'Content and messages summary'}</p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
          {isRTL ? 'تعذر تحميل المحتوى. تأكد من اتصال قاعدة البيانات.' : 'Content could not be loaded. Check the database connection.'}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ href, icon: Icon, label, value }) => (
          <Link key={href} href={href} className={`${panelCls} flex items-center justify-between p-5 transition-colors hover:bg-[#1a1a23]`}>
            <div>
              <div className="text-sm text-gray-400">{label}</div>
              <div className="mt-1 text-4xl font-bold">{loading ? '–' : value}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2A1426] text-orbia-pink">
              <Icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </section>

      <StorageMeter />

      <section className="space-y-3.5">
        <SectionHead title={isRTL ? 'آخر الأفلام' : 'Latest movies'} href="/admin/movies" linkLabel={isRTL ? 'عرض كل الأفلام' : 'View all movies'} />
        {!loading && movies.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{isRTL ? 'لا توجد أفلام بعد' : 'No movies yet'}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {movies.slice(0, 3).map((m) => (
              <div key={m.id} className={`${panelCls} overflow-hidden`}>
                <MovieThumb url={m.video_url} thumbnail={m.thumbnail_url} className="h-40 w-full" />
                <div className="space-y-1.5 p-4">
                  <div dir="auto" className="font-bold leading-6">{isRTL ? m.title_ar : m.title_en}</div>
                  <div dir="auto" className="text-[13px] text-gray-400">{isRTL ? m.title_en : m.title_ar}</div>
                  <span className={`inline-block ${chipCls}`}>{catName(m.category)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${panelCls} space-y-3.5 p-5`}>
          <SectionHead title={isRTL ? 'آخر الصور' : 'Latest photos'} href="/admin/photos" linkLabel={isRTL ? 'عرض كل الصور' : 'View all photos'} />
          {!loading && photos.length === 0 ? (
            <p className="py-10 text-center text-gray-500">{isRTL ? 'لا توجد صور بعد' : 'No photos yet'}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {photos.slice(0, 4).map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={p.image_url} alt={isRTL ? p.title_ar : p.title_en} className="aspect-[4/3] w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className={`${panelCls} space-y-1 p-5`}>
          <SectionHead title={isRTL ? 'آخر الرسائل' : 'Latest messages'} href="/admin/messages" linkLabel={isRTL ? 'عرض كل الرسائل' : 'View all messages'} />
          {!loading && messages.length === 0 ? (
            <p className="py-10 text-center text-gray-500">{isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
          ) : (
            <div className="pt-2">
              {messages.slice(0, 3).map((m) => (
                <Link key={m.id} href="/admin/messages" className="flex gap-3 border-t border-[#25252F] py-3">
                  <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${m.is_read ? 'bg-[#3A3A46]' : 'bg-orbia-pink'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${m.is_read ? 'font-semibold' : 'font-bold'}`}>{m.name} · {m.company}</span>
                      <span className="shrink-0 text-xs text-gray-500">{new Date(m.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-GB')}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[13px] text-gray-400">{m.message}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}