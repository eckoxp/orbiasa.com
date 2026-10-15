'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ScrollReveal from './anim/ScrollReveal';

const Photos = () => {
  const { t, isRTL } = useLanguage();
  const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>({
    ads: 4,
    coverage: 4,
    portraits: 4,
    products: 4,
  });
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
    title: string;
  } | null>(null);

  const categories = [
    { 
      key: 'ads', 
      title: t('photos.ads.title'),
      description: t('photos.ads.description')
    },
    { 
      key: 'coverage', 
      title: t('photos.coverage.title'),
      description: t('photos.coverage.description')
    },
    { 
      key: 'portraits', 
      title: t('photos.portraits.title'),
      description: t('photos.portraits.description')
    },
    { 
      key: 'products', 
      title: t('photos.products.title'),
      description: t('photos.products.description')
    }
  ];

  // Sample image data - fallback if API empty
  const sampleImages = {
    coverage: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    products: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    portraits: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    ads: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ]
  };

  type DbPhoto = { id: string; category: string; image_url: string };
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setDbPhotos(Array.isArray(data) ? data : []))
      .catch(() => setDbPhotos([]))
      .finally(() => setPhotosLoaded(true));
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
      } else if (event.key === 'ArrowLeft') {
        setLightbox((current) => current
          ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
          : null
        );
      } else if (event.key === 'ArrowRight') {
        setLightbox((current) => current
          ? { ...current, index: (current.index + 1) % current.images.length }
          : null
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const mergedImages = (key: keyof typeof sampleImages): string[] => {
    const filtered = dbPhotos.filter((p) => p.category === key);
    return filtered.map((p) => p.image_url);
  };

  const handleLoadMore = (key: keyof typeof sampleImages) => {
    const total = dbPhotos.filter((photo) => photo.category === key).length;
    setVisibleCounts((prev) => {
      const current = prev[key as string] ?? 4;
      return { ...prev, [key]: Math.min(total, current + 4) };
    });
  };

  const activeCategories = categories.filter((category) =>
    dbPhotos.some((photo) => photo.category === category.key)
  );

  // Enhanced Grid for one photo category - matching Movies section design
  const CategoryGrid: React.FC<{
    title: string;
    description: string;
    images: string[];
    categoryIndex: number;
    categoryKey: string;
  }> = ({ title, description, images, categoryIndex, categoryKey }) => {
    const visible = visibleCounts[categoryKey] ?? 4;
    const displayedImages = images.slice(0, visible);

    return (
      <div className="mb-32">
        {/* Enhanced Category Header - matching Movies layout */}
        <div className={`${isRTL ? 'text-right' : 'text-left'} mb-12`}>
          <div className={`flex items-baseline justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap sm:flex-nowrap`}>
            <span className="shrink-0 text-white">
              {isRTL ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
            </span>
            <h3 className={`shrink-0 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {title}
            </h3>
            <p className={`text-justify text-[13px] sm:text-sm md:text-sm lg:text-base text-white/80 leading-relaxed ${isRTL ? 'font-arabic [text-align-last:right]' : 'font-english [text-align-last:left]'} max-w-[42ch] sm:max-w-[48ch] lg:max-w-[52ch]`}>
              {description}
            </p>
          </div>
        </div>

        {/* Enhanced Photo Grid - matching Movies layout */}
        <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] max-w-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
            {displayedImages.map((src, imageIndex) => (
              <button
                key={imageIndex}
                type="button"
                className="group block w-full cursor-zoom-in text-left"
                onClick={() => setLightbox({ images, index: imageIndex, title })}
                aria-label={isRTL ? `فتح الصورة ${imageIndex + 1}` : `Open image ${imageIndex + 1}`}
              >
                <div className="relative">
                  {/* Enhanced Photo Card - matching Movies design */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100">
                    <img 
                      src={src} 
                      alt={`photo-${imageIndex}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {/* Enhanced Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-orbia-pink/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 left-6 w-1 h-1 bg-orbia-pink/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-orbia-pink/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-6 right-6 w-1 h-1 bg-orbia-pink/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Load More Button - matching Movies design */}
        {visible < images.length && (
          <div className="text-center mt-12">
            <button
              onClick={() => handleLoadMore(categoryKey as keyof typeof sampleImages)}
              className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-orbia-pink text-orbia-pink rounded-2xl font-semibold transition-all duration-500 hover:bg-orbia-pink hover:text-white hover:scale-105 hover:shadow-2xl ${isRTL ? 'font-arabic' : 'font-english'}`}
            >
              <span>{isRTL ? 'تحميل المزيد' : 'Load more'}</span>
              <div className="w-2 h-2 bg-orbia-pink rounded-full group-hover:bg-white transition-colors duration-300" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!photosLoaded || activeCategories.length === 0) return null;

  return (
    <>
      <section id="photos" className="min-h-screen relative z-10 overflow-hidden" style={{ backgroundImage: 'url(/backgrounds/newbg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Black overlay effect */}
      <div className="absolute inset-0 bg-black/50 z-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Enhanced Section Title */}
        <div className={`${isRTL ? 'text-right' : 'text-left'} mb-20`}>
          <ScrollReveal delayMs={0}>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-orbia-pink mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {t('photos.title')}
            </h2>
          </ScrollReveal>
        </div>

        {activeCategories.map((category, index) => {
          const key = category.key as keyof typeof sampleImages;
          const images = mergedImages(key);
          return (
            <ScrollReveal key={category.key} y={28} durationMs={600}>
              <CategoryGrid
                title={category.title}
                description={t(`photos.${category.key}.description`)}
                images={images}
                categoryIndex={index}
                categoryKey={category.key}
              />
            </ScrollReveal>
          );
        })}
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8"
            onClick={() => setLightbox(null)}
            aria-label={isRTL ? 'إغلاق المعاينة' : 'Close preview'}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-all hover:bg-orbia-pink sm:left-8 sm:p-4"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((current) => current
                ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
                : null
              );
            }}
            aria-label={isRTL ? 'الصورة السابقة' : 'Previous image'}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <div
            className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt={`${lightbox.title} ${lightbox.index + 1}`}
              className="max-h-[82vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            <div className={`text-sm text-white/80 ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          </div>

          <button
            type="button"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-all hover:bg-orbia-pink sm:right-8 sm:p-4"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((current) => current
                ? { ...current, index: (current.index + 1) % current.images.length }
                : null
              );
            }}
            aria-label={isRTL ? 'الصورة التالية' : 'Next image'}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  );
};

export default Photos;
