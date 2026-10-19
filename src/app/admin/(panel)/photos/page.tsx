'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PhotoRow } from '@/lib/db';
import { Plus, Edit, Trash2, Save, Upload, Search } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { notifyStorageChanged } from '@/components/admin/StorageMeter';
import { panelCls, inputCls, labelCls, primaryBtn, ghostBtn, iconBtn, chipCls } from '@/components/admin/ui';
import { uploadFileToR2, describeUploadError } from '@/lib/uploadToR2';
import Notice from '@/components/admin/Notice';
interface Category {
  slug: string;
  name_ar: string;
  name_en: string;
}

const emptyForm = { category: '', title_ar: '', title_en: '', description_ar: '', description_en: '' };

export default function AdminPhotosPage() {
  const { isRTL } = useLanguage();
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState<{ title?: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PhotoRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const load = useCallback(async () => {
    try {
      const responses = await Promise.all([fetch('/api/admin/photos'), fetch('/api/admin/categories')]);
      const [p, c] = await Promise.all(responses.map((r) => r.json().catch(() => null)));
      setPhotos(Array.isArray(p) ? p : []);
      setCats(Array.isArray(c?.photos) ? c.photos : []);
      setLoadError(
        responses.some((r) => !r.ok)
          ? isRTL
            ? 'تعذر تحميل الصور. تأكد من اتصال قاعدة البيانات.'
            : 'Photos could not be loaded. Check the database connection.'
          : ''
      );
    } catch {
      setPhotos([]);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل الصور.' : 'An error occurred while loading photos.');
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
    return photos.filter(
      (p) =>
        (filter === 'all' || p.category === filter) &&
        (!q || p.title_ar.toLowerCase().includes(q) || p.title_en.toLowerCase().includes(q))
    );
  }, [photos, filter, query]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, category: cats[0]?.slug ?? 'coverage' });
    setFiles([]);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (p: PhotoRow) => {
    setEditing(p);
    setForm({
      category: p.category,
      title_ar: p.title_ar,
      title_en: p.title_en,
      description_ar: p.description_ar,
      description_en: p.description_en,
    });
    setFiles([]);
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
    if (!editing && files.length === 0) {
      setFormError({ text: isRTL ? 'اختر صورة واحدة على الأقل.' : 'Please choose at least one image.' });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('title_ar', form.title_ar);
      fd.append('title_en', form.title_en);
      fd.append('description_ar', form.description_ar);
      fd.append('description_en', form.description_en);
      for (const file of files) {
        fd.append('image_url', await uploadFileToR2(file, 'photos'));
      }
      if (editing) fd.append('id', editing.id);

      const res = await fetch('/api/admin/photos', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      await load();
      notifyStorageChanged();
      setShowModal(false);
    } catch (error) {
      setFormError(describeUploadError(error, isRTL, isRTL ? 'تعذر حفظ الصورة' : 'Error saving photo'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: PhotoRow) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this photo?')) return;
    setPageError('');
    try {
      const res = await fetch(`/api/admin/photos/${p.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
      notifyStorageChanged();
    } catch {
      setPageError(isRTL ? 'تعذر حذف الصورة' : 'Error deleting photo');
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
          <h1 className="text-3xl font-bold">{isRTL ? 'الصور' : 'Photos'}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {isRTL
              ? `${photos.length} مشروع · ${photos.reduce((sum, p) => sum + (p.image_count || p.image_urls?.length || 1), 0)} صورة`
              : `${photos.length} projects · ${photos.reduce((sum, p) => sum + (p.image_count || p.image_urls?.length || 1), 0)} photos`}
          </p>
        </div>
        <button onClick={openAdd} className={primaryBtn}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة مشروع صور' : 'Add photo project'}
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
            placeholder={isRTL ? 'بحث عن صورة' : 'Search photos'}
            className={`${inputCls} ps-9`}
          />
        </div>
      </div>

      {!loading && visible.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          {photos.length === 0 ? (isRTL ? 'لا توجد صور بعد. أضف الصورة الأولى!' : 'No photos yet. Add your first photo!') : isRTL ? 'لا توجد نتائج' : 'No results'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <div key={p.id} className={`${panelCls} relative flex flex-col overflow-hidden`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={isRTL ? p.title_ar : p.title_en} className="h-44 w-full object-cover" />
              {(p.image_count || p.image_urls?.length || 1) > 1 && (
                <span className="absolute m-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold text-white">
                  {p.image_count || p.image_urls?.length} {isRTL ? 'صور' : 'photos'}
                </span>
              )}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div dir="auto" className="font-bold leading-6">{isRTL ? p.title_ar : p.title_en}</div>
                <div dir="auto" className="text-[13px] text-gray-400">{isRTL ? p.title_en : p.title_ar}</div>
                <p dir="auto" className="line-clamp-2 text-xs text-gray-500">{isRTL ? p.description_ar : p.description_en}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className={chipCls}>{catName(p.category)}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(p)} className={iconBtn} aria-label={isRTL ? 'تعديل' : 'Edit'}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p)} className={`${iconBtn} text-[#F08A97]`} aria-label={isRTL ? 'حذف' : 'Delete'}>
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
          title={editing ? (isRTL ? 'تعديل مشروع الصور' : 'Edit photo project') : isRTL ? 'إضافة مشروع صور جديد' : 'Add new photo project'}
          closeLabel={isRTL ? 'إغلاق' : 'Close'}
          onClose={closeModal}
        >
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className={labelCls}>{isRTL ? 'الفئة' : 'Category'}</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                {cats.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {isRTL ? `${c.name_ar} / ${c.name_en}` : `${c.name_en} / ${c.name_ar}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>{isRTL ? 'صور المشروع' : 'Project images'}</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-[#25252F] p-4 transition-colors hover:border-orbia-pink">
                <Upload className="h-8 w-8 shrink-0 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {files.length > 0
                    ? (isRTL ? `تم اختيار ${files.length} صورة` : `${files.length} images selected`)
                    : (isRTL ? 'اختر صورة أو عدة صور من جهازك' : 'Choose one or multiple images')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
              {(previews.length > 0 || editing?.image_urls?.length) && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {(previews.length > 0 ? previews : editing?.image_urls || [editing?.image_url || '']).map((src, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={`${src}-${index}`} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelCls}>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                <input type="text" className={inputCls} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                <input type="text" className={inputCls} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelCls}>{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                <textarea rows={4} className={`${inputCls} resize-none`} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                <textarea rows={4} className={`${inputCls} resize-none`} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} required />
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
                {busy ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : editing ? (isRTL ? 'تحديث المشروع' : 'Update project') : isRTL ? 'إضافة المشروع' : 'Add project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
