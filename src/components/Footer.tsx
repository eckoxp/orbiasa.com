'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const nav = [
    { key: 'home', href: '#home' },
    { key: 'ourServices', href: '#our-services' },
    { key: 'movies', href: '#movies' },
    { key: 'photos', href: '#photos' },
    { key: 'ourPartners', href: '#our-partners' },
    { key: 'contactUs', href: '#contact' },
  ];

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Brand + About */}
          <div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <img src="/icons/logo-orbia.svg" alt="ORBIA Logo" className="h-8 w-auto" />
              <span className="text-white text-xl font-bold font-arabic">{t('company.name')}</span>
            </div>
            <p className="text-white/70 text-sm leading-6 font-arabic">
              {t('footer.about') ?? ''}
            </p>
          </div>

          {/* Navigation */}
          <div className={`${isRTL ? 'md:order-3' : ''}`}>
            <h4 className={`text-white font-semibold mb-4 font-arabic ${isRTL ? 'text-right' : 'text-left'}`}>{t('footer.links') ?? 'Links'}</h4>
            <div className={`grid grid-cols-2 gap-3 ${isRTL ? 'rtl' : ''}`}>
              {nav.map((n) => (
                <button
                  key={n.key}
                  onClick={() => scrollTo(n.href)}
                  className={`text-white/75 hover:text-white text-sm ${isRTL ? 'text-right' : 'text-left'} font-arabic`}
                >
                  {t(`navigation.${n.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-arabic">{t('footer.contact') ?? 'Contact'}</h4>
            <div className="space-y-3 text-white/80 text-sm">
              <div className="flex items-center space-x-3 rtl:space-x-reverse"><MapPin className="w-4 h-4 text-orbia-pink" /><span className="font-arabic">{t('contact.info.address')}</span></div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse"><Mail className="w-4 h-4 text-orbia-pink" /><span className="font-arabic">{t('contact.info.email')}</span></div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse"><Phone className="w-4 h-4 text-orbia-pink" /><span className="font-arabic">{t('contact.info.phone')}</span></div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-5">
              <a href="https://www.instagram.com/orbia.sa?igsh=ZjRkcnYxbWpoeDk3" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" aria-label="LinkedIn" className="text-white/60 hover:text-white"><Linkedin className="w-5 h-5" /></a>
              <a href="https://x.com/orbiasa_" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-white/60 hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''} items-center justify-between`}>
          <div className="text-center md:text-left">
            <p className="text-white/60 text-xs font-arabic">© {new Date().getFullYear()} ORBIA. {t('footer.rights') ?? 'All rights reserved.'}</p>
            <p className={`text-white/40 text-xs mt-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? 'شركة احفورة للدعايه والاعلان' : 'Ahfoura Advertising Company'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


