'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PenTool, Scissors, Camera, Globe } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const OurServices = () => {
  const { t, isRTL } = useLanguage();
  const { ref: servicesRef, isVisible: isServicesVisible } = useScrollAnimation({
    threshold: 0.03,
    rootMargin: '0px 0px 140px 0px'
  });

  const services = [
    {
      key: 'contentWriting',
      icon: PenTool,
      title: {
        ar: 'كتابة المحتوى',
        en: 'Content Writing'
      },
      description: {
        ar: 'من ابتكار الفكرة وحتى كتابتها نقدم لك قصة مميزة لكافة أعمالك: سيناريو سينمائي - أفلام قصيرة - أفلام وثائقية - أعمال إعلانية - موشن جرافيك.',
        en: 'From idea generation to writing, we offer you a unique story for all your works: cinematic screenplay - short films - documentary films - advertising works - motion graphics.'
      }
    },
    {
      key: 'photography',
      icon: Camera,
      title: {
        ar: 'التصوير',
        en: 'Photography/Filming'
      },
      description: {
        ar: 'كافة تقنيات ومعدات التصوير من التصوير الفوتوغرافي حتى التصوير الجوي، لتصوير الأعمال السينمائية والإعلانية وتغطية الأحداث والفعاليات.',
        en: 'All photography techniques and equipment from still photography to aerial photography, for filming cinematic and advertising works and covering events and activities.'
      }
    },
    {
      key: 'editing',
      icon: Scissors,
      title: {
        ar: 'المونتاج',
        en: 'Editing'
      },
      description: {
        ar: 'من تحرير المشاهد وتصحيح الألوان، نقدم خدمات مونتاج احترافية جنبًا إلى جنب مع الإخراج الإبداعي، حرصاً على تناسق العمل المرئي ووصول الفكرة.',
        en: 'From scene editing and color correction, we offer professional editing services hand in hand with creative direction, ensuring visual consistency and conveying the idea.'
      }
    },
    {
      key: 'graphics',
      icon: Globe,
      title: {
        ar: 'الجرافيك',
        en: 'Graphics'
      },
      description: {
        ar: 'من الموشن جرافيك والتحريك ثنائي وثلاثي الأبعاد إلى تصميم المشاهد المعززة بالمؤثرات البصرية، نوفر خدمات متكاملة للجرافيك بأحدث البرامج والتقنيات.',
        en: 'From motion graphics and 2D/3D animation to designing scenes enhanced with visual effects, we provide integrated graphics services using the latest software and techniques.'
      }
    }
  ];

  return (
    <section ref={servicesRef} id="our-services" className="min-h-screen flex items-center relative overflow-hidden z-10">
      {/* Enhanced Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/services.jpg')"
        }}
      />
      
      {/* Enhanced Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80" />
      
      {/* Advanced Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-orbia-pink/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tl from-orbia-pink/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-gradient-to-bl from-orbia-pink/8 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orbia-pink/40 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-orbia-pink/30 rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        {/* Enhanced Section Title */}
        <div className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Title with Slide-in Animation (Right to Left) */}
          <h2 className={`reveal-soft text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 ${isRTL ? 'font-arabic' : 'font-english'} ${isServicesVisible ? 'reveal-soft-visible' : ''}`} style={{ transitionDelay: '0.03s' }}>
            {isRTL ? 'خدماتنا' : 'Our Services'}
          </h2>
          
          {/* Description with Slide-in Animation (Left to Right) */}
          <p className={`reveal-soft text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed ${isRTL ? 'font-arabic text-right ml-auto' : 'font-english text-left'} ${isServicesVisible ? 'reveal-soft-visible' : ''}`} style={{ transitionDelay: '0.09s' }}>
            {isRTL 
              ? 'نقدم حلولاً إبداعية شاملة في مجال الإنتاج المرئي، مصممة خصيصاً لتلبية احتياجاتك وتجاوز توقعاتك'
              : 'We provide comprehensive creative solutions in visual production, specifically designed to meet your needs and exceed your expectations'
            }
          </p>
        </div>

        {/* Modern Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={service.key} className={`reveal-soft ${isServicesVisible ? 'reveal-soft-visible' : ''}`} style={{ transitionDelay: `${0.14 + (index * 0.06)}s` }}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                  
                  {/* Service Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-orbia-pink/20 backdrop-blur-sm p-3 rounded-lg border border-orbia-pink/30">
                      <IconComponent className="w-6 h-6 text-orbia-pink" />
                    </div>
                  </div>
                  
                  {/* Service Title */}
                  <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? service.title.ar : service.title.en}
                  </h3>
                  
                  {/* Service Description */}
                  <p className={`text-gray-300 leading-relaxed text-center ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? service.description.ar : service.description.en}
                  </p>
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </section>
  );
};

export default OurServices;
