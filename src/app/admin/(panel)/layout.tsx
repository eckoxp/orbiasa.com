'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutDashboard, Film, Image as ImageIcon, Mail, Home, LogOut, Globe, Menu } from 'lucide-react';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { isRTL, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/messages/count')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.unread === 'number') setUnread(d.unread);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const items = [
    { href: '/admin', icon: LayoutDashboard, label: isRTL ? 'لوحة التحكم' : 'Dashboard', badge: 0 },
    { href: '/admin/movies', icon: Film, label: isRTL ? 'الأفلام' : 'Movies', badge: 0 },
    { href: '/admin/photos', icon: ImageIcon, label: isRTL ? 'الصور' : 'Photos', badge: 0 },
    { href: '/admin/messages', icon: Mail, label: isRTL ? 'الرسائل' : 'Messages', badge: unread },
  ];

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const logout = async () => {
    if (!confirm(isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?')) return;
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    window.location.href = '/admin/login';
  };

  const linkBase = 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[15px] transition-colors';

  return (
    <div className="min-h-screen bg-[#0B0B10] text-white md:flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#14070F] border-b border-[#2A1426] px-4 py-3">
        <span className="font-bold tracking-widest">ORBIA</span>
        <button onClick={() => setOpen(true)} aria-label={isRTL ? 'القائمة' : 'Menu'} className="p-1">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 flex flex-col gap-1.5 bg-[#14070F] border-e border-[#2A1426] p-4 transition-transform md:sticky md:top-0 md:h-screen md:shrink-0 ${
          open ? 'translate-x-0' : 'max-md:ltr:-translate-x-full max-md:rtl:translate-x-full'
        }`}
      >
        <div className="px-3.5 pt-1 pb-5">
          <div className="text-2xl font-bold tracking-widest">ORBIA</div>
          <div className="text-[13px] text-[#9A7F95]">{isRTL ? 'لوحة التحكم' : 'Admin Panel'}</div>
        </div>

        {items.map(({ href, icon: Icon, label, badge }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`${linkBase} ${isActive(href) ? 'bg-orbia-pink text-white' : 'text-[#C9B8C6] hover:bg-white/5'}`}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{label}</span>
            {badge > 0 && (
              <span className="ms-auto bg-orbia-pink text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
            )}
          </Link>
        ))}

        <div className="mt-auto flex flex-col gap-1.5 border-t border-[#2A1426] pt-4">
          <button onClick={toggleLanguage} className={`${linkBase} text-[#C9B8C6] hover:bg-white/5`}>
            <Globe className="w-[18px] h-[18px]" />
            <span>{isRTL ? 'English' : 'عربي'}</span>
          </button>
          <Link href="/" className={`${linkBase} text-[#C9B8C6] hover:bg-white/5`}>
            <Home className="w-[18px] h-[18px]" />
            <span>{isRTL ? 'العودة للموقع' : 'Back to website'}</span>
          </Link>
          <button onClick={logout} className={`${linkBase} text-[#C9B8C6] hover:bg-white/5`}>
            <LogOut className="w-[18px] h-[18px]" />
            <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}