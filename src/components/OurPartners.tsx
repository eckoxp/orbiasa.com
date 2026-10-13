'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScrollReveal from './anim/ScrollReveal';

const OurPartners = () => {
  const { t, isRTL } = useLanguage();

  // Load partner logos from public/partners (01.png ... 35.png), excluding 09.png
  const partners = Array.from({ length: 35 }, (_, i) => {
    const id = String(i + 1).padStart(2, '0');
    return { name: `Partner ${id}`, logo: `/partners/${id}.png` };
  }).filter((_, index) => index !== 8); // Remove 09.png (index 8)

  const subtitle = t('partners.subtitle');
  const showSubtitle = Boolean(subtitle) && subtitle !== 'partners.subtitle';

  return (
    <section 
      id="our-partners" 
      className="relative min-h-screen overflow-hidden z-10 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/backgrounds/newbg.png)',
      }}
    >
      {/* Black overlay effect */}
      <div className="absolute inset-0 bg-black/50 z-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        {/* Enhanced Section Title */}
        <ScrollReveal className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-orbia-pink mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('partners.title')}
          </h2>
          
          <p className={`text-lg md:text-xl text-white max-w-3xl leading-relaxed ${isRTL ? 'font-arabic text-right ml-auto' : 'font-english text-left'}`}>
            {isRTL 
              ? 'نفتخر بشراكتنا مع أبرز العلامات التجارية والمؤسسات الرائدة في مجال الإنتاج المرئي والإبداعي'
              : 'We are proud to partner with leading brands and institutions in the field of visual and creative production'
            }
          </p>
        </ScrollReveal>

        {/* Simple Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-16">
          {partners.map((partner, index) => (
            <ScrollReveal key={index} delayMs={index * 100} className="group">
              <div className="flex items-center justify-center p-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 md:max-h-20 w-auto object-contain"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      
      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </section>
  );
};

export default OurPartners;
