'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
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
    <section className={`${panelCls} space-y-4 p-5`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2A1426] text-orbia-pink">
          <HardDrive className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{isRTL ? 'مساحة التخزين' : 'Storage'}</h2>
          <p className="text-xs text-gray-500">{isRTL ? 'الملفات المرفوعة على Cloudflare R2' : 'Files uploaded to Cloudflare R2'}</p>
        </div>
      </div>

      {failed && !usage ? (
        <p className="text-sm text-amber-200">{isRTL ? 'تعذر قراءة المساحة. تأكد من إعدادات R2.' : 'Could not read storage usage. Check the R2 settings.'}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {stat(isRTL ? 'الإجمالي' : 'Total', usage ? formatSize(usage.limitBytes, isRTL) : '...')}
            {stat(isRTL ? 'المستخدم' : 'Used', usage ? formatSize(usage.usedBytes, isRTL) : '...')}
            {stat(isRTL ? 'المتبقي' : 'Remaining', usage ? formatSize(usage.remainingBytes, isRTL) : '...')}
          </div>
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-[#2A1426]">
              <div className={`h-full rounded-full ${barColor} transition-[width] duration-300`} style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-gray-500">
              <span>{percent.toFixed(1)}%</span>
              <span>{usage ? (isRTL ? `${usage.objectCount} ملف` : `${usage.objectCount} files`) : ''}</span>
            </div>
          </div>
          {full ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {isRTL ? 'تم الوصول للحد الأقصى. رفع الملفات الجديدة متوقف حتى يتم حذف ملفات.' : 'Limit reached. New uploads are disabled until files are deleted.'}
            </p>
          ) : percent >= 95 ? (
            <p className="text-sm text-red-300">{isRTL ? 'المساحة على وشك الانتهاء.' : 'Storage is almost full.'}</p>
          ) : percent >= 80 ? (
            <p className="text-sm text-amber-300">{isRTL ? 'تم استخدام أكثر من 80% من المساحة.' : 'More than 80% of the storage is used.'}</p>
          ) : null}
        </>
      )}
    </section>
  );
}