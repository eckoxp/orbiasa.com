'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MovieRow } from '@/lib/db';
import { Plus, Edit, Trash2, Save, Upload, Search, Image as ImageIcon } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { notifyStorageChanged } from '@/components/admin/StorageMeter';
import MovieThumb from '@/components/admin/MovieThumb';
import { panelCls, inputCls, labelCls, primaryBtn, ghostBtn, iconBtn, chipCls } from '@/components/admin/ui';
import { uploadFileToR2, describeUploadError } from '@/lib/uploadToR2';
import Notice from '@/components/admin/Notice';
interface Category {
  slug: string;
  name_ar: string;
  name_en: string;
}



const emptyForm = { category: '', title_ar: '', title_en: '', video_url: '' };

export default function AdminMoviesPage() {
  const { isRTL } = useLanguage();
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState<{ title?: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MovieRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const thumbPreview = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : null), [thumbFile]);
  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
  }, [thumbPreview]);

  const load = useCallback(async () => {
    try {
      const responses = await Promise.all([fetch('/api/admin/movies'), fetch('/api/admin/categories')]);
      const [m, c] = await Promise.all(responses.map((r) => r.json().catch(() => null)));
      setMovies(Array.isArray(m) ? m : []);
      setCats(Array.isArray(c?.movies) ? c.movies : []);
      setLoadError(
        responses.some((r) => !r.ok)
          ? isRTL
            ? 'تعذر تحميل الأفلام. تأكد من اتصال قاعدة البيانات.'
            : 'Movies could not be loaded. Check the database connection.'
          : ''
      );
    } catch {
      setMovies([]);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل الأفلام.' : 'An error occurred while loading movies.');
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    load();
  }, [load]);

  const catName = (slug: string) => {
    const c = cats.find((x) => x.slug === slug);
    return c ? (isRTL ? c.name_ar : c.name_en) : slug;
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter(
      (m) =>
        (filter === 'all' || m.category === filter) &&
        (!q || m.title_ar.toLowerCase().includes(q) || m.title_en.toLowerCase().includes(q))
    );
  }, [movies, filter, query]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, category: cats[0]?.slug ?? 'advertisements' });
    setVideoFile(null);
    setThumbFile(null);
    setProgress(0);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (m: MovieRow) => {
    setEditing(m);
    setForm({ category: m.category, title_ar: m.title_ar, title_en: m.title_en, video_url: m.video_url });
    setVideoFile(null);
    setThumbFile(null);
    setProgress(0);
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (busy) return;
    setShowModal(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      let videoUrl = form.video_url.trim();

      if (videoFile) {
        videoUrl = await uploadFileToR2(videoFile, 'movies', setProgress);
      }

      if (!videoUrl) {
        throw new Error(isRTL ? 'أدخل رابط فيديو أو اختر ملف فيديو لرفعه.' : 'Enter a video URL or choose a video file to upload.');
      }

      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('title_ar', form.title_ar);
      fd.append('title_en', form.title_en);
      fd.append('video_url', videoUrl);
      if (editing) fd.append('id', editing.id);
      if (thumbFile) fd.append('thumbnail_url', await uploadFileToR2(thumbFile, 'movie-thumbnails'));

      const res = await fetch('/api/admin/movies', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      await load();
      notifyStorageChanged();
      setShowModal(false);
    } catch (error) {
      setFormError(describeUploadError(error, isRTL, isRTL ? 'تعذر حفظ الفيلم' : 'Error saving movie'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: MovieRow) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الفيلم؟' : 'Are you sure you want to delete this movie?')) return;
    setPageError('');
    try {
      const res = await fetch(`/api/admin/movies/${m.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
      notifyStorageChanged();
    } catch {
      setPageError(isRTL ? 'تعذر حذف الفيلم' : 'Error deleting movie');
    }
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
      active ? 'border-orbia-pink bg-orbia-pink text-white' : 'border-[#25252F] text-gray-300 hover:bg-white/5'
    }`;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isRTL ? 'الأفلام' : 'Movies'}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {isRTL ? `${movies.length} فيلم` : `${movies.length} movies`}
          </p>
        </div>
        <button onClick={openAdd} className={primaryBtn}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة فيلم' : 'Add movie'}
        </button>
      </header>

      {loadError && <Notice tone="warning">{loadError}</Notice>}
      {pageError && (
        <Notice tone="error" onClose={() => setPageError('')} closeLabel={isRTL ? 'إغلاق' : 'Close'}>
          {pageError}
        </Notice>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={chip(filter === 'all')}>
            {isRTL ? 'الكل' : 'All'}
          </button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => setFilter(c.slug)} className={chip(filter === c.slug)}>
              {isRTL ? c.name_ar : c.name_en}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن فيلم' : 'Search movies'}
            className={`${inputCls} ps-9`}
          />
        </div>
      </div>

      {!loading && visible.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          {movies.length === 0 ? (isRTL ? 'لا توجد أفلام بعد. أضف الفيلم الأول!' : 'No movies yet. Add your first movie!') : isRTL ? 'لا توجد نتائج' : 'No results'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <div key={m.id} className={`${panelCls} flex flex-col overflow-hidden`}>
              <MovieThumb url={m.video_url} thumbnail={m.thumbnail_url} className="h-44 w-full" />
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div dir="auto" className="font-bold leading-6">{isRTL ? m.title_ar : m.title_en}</div>
                <div dir="auto" className="text-[13px] text-gray-400">{isRTL ? m.title_en : m.title_ar}</div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className={chipCls}>{catName(m.category)}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(m)} className={iconBtn} aria-label={isRTL ? 'تعديل' : 'Edit'}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(m)} className={`${iconBtn} text-[#F08A97]`} aria-label={isRTL ? 'حذف' : 'Delete'}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? (isRTL ? 'تعديل فيلم' : 'Edit movie') : isRTL ? 'إضافة فيلم جديد' : 'Add new movie'}
          closeLabel={isRTL ? 'إغلاق' : 'Close'}
          onClose={closeModal}
        >
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelCls}>{isRTL ? 'الفئة' : 'Category'}</label>
                <select
                  className={inputCls}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  {cats.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {isRTL ? `${c.name_ar} / ${c.name_en}` : `${c.name_en} / ${c.name_ar}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{isRTL ? 'رابط الفيديو' : 'Video URL'}</label>
                <input
                  type="url"
                  className={inputCls}
                  placeholder={isRTL ? 'رابط Dropbox أو YouTube/Vimeo' : 'Dropbox, YouTube or Vimeo URL'}
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="h-px flex-1 bg-[#25252F]" />
              <span>{isRTL ? 'أو ارفع ملف فيديو مباشرة' : 'Or upload a video file directly'}</span>
              <div className="h-px flex-1 bg-[#25252F]" />
            </div>

            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#25252F] p-6 transition-colors hover:border-orbia-pink">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {videoFile ? videoFile.name : isRTL ? 'اختر ملف فيديو من جهازك' : 'Choose a video file from your device'}
                </span>
                <span className="text-xs text-gray-500">MP4, WebM, MOV</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    setVideoFile(e.target.files?.[0] || null);
                    setProgress(0);
                  }}
                />
              </label>
              {progress > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>{isRTL ? 'جاري رفع الفيديو' : 'Uploading video'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#25252F]">
                    <div className="h-full rounded-full bg-orbia-pink transition-[width] duration-200" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {isRTL ? 'عند اختيار ملف، سيتم استخدامه بدل الرابط المكتوب.' : 'When a file is selected, it is used instead of the entered URL.'}
              </p>
            </div>

            <div>
              <label className={labelCls}>{isRTL ? 'صورة مصغرة للفيديو (اختيارية)' : 'Video thumbnail (optional)'}</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-[#25252F] p-4 transition-colors hover:border-orbia-pink">
                {thumbPreview || editing?.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbPreview || editing?.thumbnail_url || ''} alt="" className="h-20 w-32 rounded-lg object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-sm text-gray-300">
                  {thumbFile ? thumbFile.name : isRTL ? 'اختر صورة مصغرة (PNG, JPG, WEBP)' : 'Choose a thumbnail (PNG, JPG, WEBP)'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelCls}>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.title_ar}
                  onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                  required
                />
              </div>
            </div>

            {formError && (
              <Notice tone="error" title={formError.title}>
                {formError.text}
              </Notice>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className={ghostBtn}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" disabled={busy} className={primaryBtn}>
                <Save className="h-4 w-4" />
                {busy ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : editing ? (isRTL ? 'تحديث الفيلم' : 'Update movie') : isRTL ? 'إضافة الفيلم' : 'Add movie'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}