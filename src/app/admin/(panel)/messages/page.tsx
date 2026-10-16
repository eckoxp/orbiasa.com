'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2, Mail, MailOpen } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { isRTL } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error(data?.error || 'Failed to load');
      setMessages(data);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRead = async (id: number, isRead: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m)));
    await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ is_read: isRead }) });
  };

  const toggleOpen = (m: ContactMessage) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next !== null && !m.is_read) setRead(m.id, true);
  };

  const remove = async (id: number) => {
    if (!confirm(isRTL ? 'حذف هذه الرسالة نهائياً؟' : 'Delete this message permanently?')) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen bg-black text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? 'رسائل التواصل' : 'Contact Messages'}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {isRTL ? `${messages.length} رسالة، ${unread} غير مقروءة` : `${messages.length} messages, ${unread} unread`}
            </p>
          </div>
        </div>

        {loading && <p className="text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && messages.length === 0 && (
          <p className="text-gray-500 text-center py-16">{isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
        )}

        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-xl border ${m.is_read ? 'border-gray-800 bg-gray-950' : 'border-blue-500/50 bg-blue-950/20'}`}>
              <button onClick={() => toggleOpen(m)} className="w-full text-start p-4 flex items-start gap-3">
                {m.is_read ? <MailOpen className="w-5 h-5 mt-0.5 text-gray-500" /> : <Mail className="w-5 h-5 mt-0.5 text-blue-400" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`truncate ${m.is_read ? 'font-medium' : 'font-bold'}`}>{m.name} · {m.company}</span>
                    <span className="text-xs text-gray-500 shrink-0">{new Date(m.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-GB')}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate mt-1">{m.message}</p>
                </div>
              </button>

              {openId === m.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-3">
                  <p className="whitespace-pre-wrap text-gray-200">{m.message}</p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>{isRTL ? 'البريد' : 'Email'}: <a className="text-blue-400" href={`mailto:${m.email}`}>{m.email}</a></p>
                    <p>{isRTL ? 'الجوال' : 'Phone'}: <a className="text-blue-400" href={`tel:${m.phone}`} dir="ltr">{m.phone}</a></p>
                    {m.position && <p>{isRTL ? 'المنصب' : 'Position'}: {m.position}</p>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setRead(m.id, !m.is_read)} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg">
                      {m.is_read ? (isRTL ? 'تحديد كغير مقروءة' : 'Mark unread') : (isRTL ? 'تحديد كمقروءة' : 'Mark read')}
                    </button>
                    <button onClick={() => remove(m.id)} className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      {isRTL ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}