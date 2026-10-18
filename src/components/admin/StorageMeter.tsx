'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HardDrive } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Notice from '@/components/admin/Notice';
import { panelCls } from '@/components/admin/ui';

interface Usage {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  objectCount: number;
}

const STORAGE_UPDATED_EVENT = 'storage-updated';

// Call this after something was uploaded or deleted so every meter refreshes.
export const notifyStorageChanged = () => window.dispatchEvent(new Event(STORAGE_UPDATED_EVENT));

const GIB = 1024 ** 3;
const MIB = 1024 ** 2;

const formatSize = (bytes: number, isRTL: boolean) =>
  bytes >= GIB
    ? `${(bytes / GIB).toFixed(2)} ${isRTL ? 'جيجا' : 'GB'}`
    : `${(bytes / MIB).toFixed(1)} ${isRTL ? 'ميجا' : 'MB'}`;

export default function StorageMeter({ compact = false }: { compact?: boolean }) {
  const { isRTL } = useLanguage();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/storage');
      const data = await res.json();
      if (!res.ok) throw new Error('Request failed');
      setUsage(data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(STORAGE_UPDATED_EVENT, load);
    return () => window.removeEventListener(STORAGE_UPDATED_EVENT, load);
  }, [load]);

  const percent = usage ? Math.min(100, (usage.usedBytes / usage.limitBytes) * 100) : 0;
  const full = Boolean(usage) && usage!.remainingBytes <= 0;
  const barColor = percent >= 95 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-orbia-pink';

  if (compact) {
    return (
      <div className="space-y-1.5 px-3.5 py-3 text-xs">
        <div className="flex items-center justify-between text-[#C9B8C6]">
          <span>{isRTL ? 'التخزين' : 'Storage'}</span>
          <span dir="ltr">{usage ? `${formatSize(usage.usedBytes, isRTL)} / ${formatSize(usage.limitBytes, isRTL)}` : failed ? '—' : '...'}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#2A1426]">
          <div className={`h-full rounded-full ${barColor} transition-[width] duration-300`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  const stat = (label: string, value: string) => (
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-bold" dir="ltr">{value}</div>
    </div>
  );

  return (
    <section className={`${panelCls} space-y-4 p-5 ${full ? 'border-red-500/40' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${full ? 'bg-red-500/15 text-red-400' : 'bg-[#2A1426] text-orbia-pink'}`}>
          <HardDrive className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">{isRTL ? 'مساحة التخزين' : 'Storage'}</h2>
          <p className="text-xs text-gray-500">{isRTL ? 'الملفات المرفوعة على Cloudflare R2' : 'Files uploaded to Cloudflare R2'}</p>
        </div>
        {usage && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              percent >= 95 ? 'bg-red-500/15 text-red-300' : percent >= 80 ? 'bg-amber-500/15 text-amber-300' : 'bg-[#2A1426] text-[#F08A97]'
            }`}
            dir="ltr"
          >
            {percent.toFixed(percent >= 10 ? 0 : 1)}%
          </span>
        )}
      </div>

      {failed && !usage ? (
        <p className="text-sm text-amber-200">{isRTL ? 'تعذر قراءة المساحة. تأكد من إعدادات R2.' : 'Could not read storage usage. Check the R2 settings.'}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {stat(isRTL ? 'المستخدم' : 'Used', usage ? formatSize(usage.usedBytes, isRTL) : '...')}
            {stat(isRTL ? 'المتبقي' : 'Remaining', usage ? formatSize(usage.remainingBytes, isRTL) : '...')}
            {stat(isRTL ? 'الإجمالي' : 'Total', usage ? formatSize(usage.limitBytes, isRTL) : '...')}
          </div>
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-[#2A1426]">
              <div className={`h-full rounded-full ${barColor} transition-[width] duration-300`} style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-1.5 text-xs text-gray-500">
              {usage ? (isRTL ? `${usage.objectCount} ملف` : `${usage.objectCount} files`) : ''}
            </div>
          </div>
          {full ? (
            <Notice
              tone="error"
              title={isRTL ? 'تم الوصول للحد الأقصى للتخزين' : 'Storage limit reached'}
              action={
                <>
                  <Link href="/admin/movies" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15">
                    {isRTL ? 'إدارة الأفلام' : 'Manage movies'}
                  </Link>
                  <Link href="/admin/photos" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15">
                    {isRTL ? 'إدارة الصور' : 'Manage photos'}
                  </Link>
                </>
              }
            >
              {isRTL
                ? 'رفع الملفات الجديدة متوقف. احذف بعض الأفلام أو الصور لتفريغ مساحة.'
                : 'New uploads are disabled. Delete some movies or photos to free up space.'}
            </Notice>
          ) : percent >= 95 ? (
            <Notice tone="warning" title={isRTL ? 'المساحة على وشك الانتهاء' : 'Storage is almost full'}>
              {isRTL ? 'سيتوقف رفع الملفات الجديدة عند الوصول للحد الأقصى.' : 'New uploads will stop when the limit is reached.'}
            </Notice>
          ) : percent >= 80 ? (
            <p className="text-sm text-amber-300">{isRTL ? 'تم استخدام أكثر من 80% من المساحة.' : 'More than 80% of the storage is used.'}</p>
          ) : null}
        </>
      )}
    </section>
  );
}