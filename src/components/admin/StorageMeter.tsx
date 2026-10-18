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

// Decimal units (1 GB = 1,000,000,000 bytes), the same way storage dashboards show sizes.
const GB = 1000 ** 3;
const MB = 1000 ** 2;
const KB = 1000;

function formatSize(bytes: number, isRTL: boolean): { value: string; unit: string } {
  if (bytes >= GB) return { value: String(Number((bytes / GB).toFixed(2))), unit: isRTL ? 'جيجا' : 'GB' };
  if (bytes >= MB) return { value: (bytes / MB).toFixed(1), unit: isRTL ? 'ميجا' : 'MB' };
  if (bytes >= KB) return { value: String(Math.round(bytes / KB)), unit: isRTL ? 'كيلو' : 'KB' };
  return { value: String(bytes), unit: isRTL ? 'بايت' : 'B' };
}

function Size({ bytes, isRTL }: { bytes: number; isRTL: boolean }) {
  const { value, unit } = formatSize(bytes, isRTL);
  return (
    <>
      <span dir="ltr">{value}</span> <span>{unit}</span>
    </>
  );
}

const formatPercent = (percent: number) => (percent < 1 ? percent.toFixed(2) : percent < 10 ? percent.toFixed(1) : percent.toFixed(0));

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
  // A tiny amount of usage would be an invisible bar, so give it a minimum width.
  const barWidth = usage && usage.usedBytes > 0 ? Math.max(percent, 1.5) : 0;
  const full = Boolean(usage) && usage!.remainingBytes <= 0;
  const barColor = percent >= 95 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-orbia-pink';
  const badgeColor =
    percent >= 95 ? 'bg-red-500/15 text-red-300' : percent >= 80 ? 'bg-amber-500/15 text-amber-300' : 'bg-[#2A1426] text-[#F08A97]';

  if (compact) {
    return (
      <div className="space-y-1.5 px-3.5 py-3 text-xs">
        <div className="flex items-center justify-between text-[#C9B8C6]">
          <span>{isRTL ? 'التخزين' : 'Storage'}</span>
          <span>
            {usage ? (
              <>
                <Size bytes={usage.usedBytes} isRTL={isRTL} /> / <Size bytes={usage.limitBytes} isRTL={isRTL} />
              </>
            ) : failed ? (
              '—'
            ) : (
              '...'
            )}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#2A1426]">
          <div className={`h-full rounded-full ${barColor} transition-[width] duration-300`} style={{ width: `${barWidth}%` }} />
        </div>
      </div>
    );
  }

  return (
    <section className={`${panelCls} space-y-5 p-5 ${full ? 'border-red-500/40' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${full ? 'bg-red-500/15 text-red-400' : 'bg-[#2A1426] text-orbia-pink'}`}>
          <HardDrive className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">{isRTL ? 'مساحة التخزين' : 'Storage'}</h2>
          <p className="text-xs text-gray-500">{isRTL ? 'الملفات المرفوعة على Cloudflare R2' : 'Files uploaded to Cloudflare R2'}</p>
        </div>
        {usage && (
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${badgeColor}`} dir="ltr">
            {formatPercent(percent)}%
          </span>
        )}
      </div>

      {failed && !usage ? (
        <p className="text-sm text-amber-200">{isRTL ? 'تعذر قراءة المساحة. تأكد من إعدادات R2.' : 'Could not read storage usage. Check the R2 settings.'}</p>
      ) : !usage ? (
        <p className="text-sm text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-4xl font-bold leading-tight">
                <Size bytes={usage.usedBytes} isRTL={isRTL} />
              </span>
              <span className="text-gray-400">
                {isRTL ? 'مستخدمة من' : 'used of'}{' '}
                <span className="font-semibold text-gray-200">
                  <Size bytes={usage.limitBytes} isRTL={isRTL} />
                </span>
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#2A1426]">
              <div className={`h-full rounded-full ${barColor} transition-[width] duration-300`} style={{ width: `${barWidth}%` }} />
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
              <span>
                {isRTL ? 'المتبقي:' : 'Remaining:'}{' '}
                <span className="font-semibold text-gray-200">
                  <Size bytes={usage.remainingBytes} isRTL={isRTL} />
                </span>
              </span>
              <span>{isRTL ? `${usage.objectCount} ملف` : `${usage.objectCount} files`}</span>
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