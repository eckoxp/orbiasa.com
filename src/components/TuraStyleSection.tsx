'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function VisionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MissionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 3 9 15" />
      <path d="M15 3h6v6" />
      <path d="M10.5 7.5 3 15l-1 6 6-1 7.5-7.5" />
    </svg>
  );
}

function StoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ExpertiseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

const TuraStyleSection = () => {
  const { t, isRTL } = useLanguage();
  const { ref: sectionRef, isVisible: isSectionVisible } = useScrollAnimation({
    threshold: 0.03,
    rootMargin: '0px 0px 140px 0px'
  });

  return (
    <section ref={sectionRef} aria-labelledby="tura-style-title" className="py-24 relative overflow-hidden z-10 bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" dir="ltr">
          {/* Title and Description Section - Right side in Arabic mode, Left side in English mode */}
          <div className={`${isRTL ? 'lg:col-start-2 lg:row-start-1' : 'lg:col-start-1 lg:row-start-1'} self-center flex items-center justify-center`}>
            <div className={`${isRTL ? 'text-right' : 'text-left'} max-w-lg`}>
              {/* Title with Slide-in Animation (Right to Left) */}
              <h2 id="tura-style-title" className={`text-3xl md:text-4xl lg:text-5xl font-bold text-orbia-pink leading-tight mb-6 ${isRTL ? 'font-arabic' : 'font-english'} ${isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40px]'}`} style={{ transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.04s' }}>
                {isRTL ? "حلمنا واسع كفضائنا" : "Our dream is as vast as our space"}
              </h2>
              
              {/* Decorative line with Slide-in Animation (Left to Right) */}
              <div className={`mt-6 h-1 w-24 rounded-full bg-orbia-pink ${isRTL ? 'ml-auto' : 'mr-auto'} ${isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-30px]'}`} style={{ transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.1s' }} />
              
              {/* Description with Slide-in Animation (Left to Right) */}
              <p className={`mt-8 text-lg md:text-xl text-gray-600 leading-relaxed ${isRTL ? 'font-arabic' : 'font-english'} ${isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-40px]'}`} style={{ transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.14s' }}>
                {isRTL 
                  ? "ﻧﻤﻠﻚ ﻓﺮﻳﻘﺎ ﻣﻦ ﺧﺒﺮات ﻣﺘﺮاﻛﻤﺔ ﺗﺘﺠﺎوز ﻋﺸﺮ ﺳﻨﻮات ﻓﻲ ﻣﺠﺎل اﻹﻧﺘﺎج، ﻳﺠﻤﻊ ﺑﻴﻦ اﻟﺤﺮﻓﺔ واﻟﻤﺮوﻧﺔ، وﻳﺠﻴﺪ اﻟﺘﻌﺎﻣﻞ ﻣﻊ ﻛﻞ ﻣﺮﺣﻠﺔ ﻣﻦ ﻣﺮاﺣﻞ اﻟﻌﻤﻞ اﻹﺑﺪاﻋﻲ"
                  : "We have a team with over ten years of accumulated experience in production, combining craftsmanship with flexibility, and excelling at handling every stage of the creative process."
                }
              </p>
            </div>
          </div>

          {/* Content without cards - Left side in Arabic mode, Right side in English mode */}
          <div className={`${isRTL ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-2 lg:row-start-1'} self-center`}>
            <div className="space-y-8">
              {/* Vision - Slide-in from Bottom */}
              <div className={`${isRTL ? 'text-right' : 'text-left'} ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[24px]'}`} style={{ transition: 'all 0.42s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.18s' }}>
                <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-orbia-pink p-2 rounded-lg text-white">
                    <VisionIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? 'رؤيتنا' : 'Our Vision'}
                  </h3>
                </div>
                <p className={`text-gray-600 leading-relaxed text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {isRTL
                    ? 'في أوربيا، نحن لا نُنتج فحسب، بل نسعى لصناعة أثر حقيقي في مجال صناعة المحتوى. نطمح أن نكون من الأسماء البارزة التي تُسهم في تشكيل الهوية البصرية للوطن وتوثيق مسيرته نحو المستقبل، ضمن إطار رؤية 2030'
                    : "In ORBIA, we don't just produce, but we strive to deliver a real impact in the content industry. We aspire to be among the prominent names that contribute to shaping the nation's visual identity and documenting its journey towards the future, within the framework of Vision 2030."}
                </p>
              </div>

              {/* Mission - Slide-in from Bottom */}
              <div className={`${isRTL ? 'text-right' : 'text-left'} ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[24px]'}`} style={{ transition: 'all 0.42s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.24s' }}>
                <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-orbia-pink p-2 rounded-lg text-white">
                    <MissionIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? 'رسالتنا' : 'Our Mission'}
                  </h3>
                </div>
                <p className={`text-gray-600 leading-relaxed text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {isRTL
                    ? 'صناعة محتوى يحمل روحًا فنية عالية، يلامس الذائقة ويترك أثرًا يتجاوز التوقع؛ محتوى يُلهم ويُبصر ويَبقى'
                    : 'Creating content that carries a high artistic spirit, one that touches taste and leaves an impact beyond expectation; content that inspires, envisions, and endures.'}
                </p>
              </div>

              {/* Our Story - Slide-in from Bottom */}
              <div className={`${isRTL ? 'text-right' : 'text-left'} ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[24px]'}`} style={{ transition: 'all 0.42s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.3s' }}>
                <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-orbia-pink p-2 rounded-lg text-white">
                    <StoryIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('ourStory.title')}
                  </h3>
                </div>
                <p className={`text-gray-600 leading-relaxed text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {t('ourStory.description')}
                </p>
              </div>

              {/* Expertise - Slide-in from Bottom */}
              <div className={`${isRTL ? 'text-right' : 'text-left'} ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[24px]'}`} style={{ transition: 'all 0.42s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.36s' }}>
                <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-orbia-pink p-2 rounded-lg text-white">
                    <ExpertiseIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? 'اختصاصنا' : 'Our Expertise'}
                  </h3>
                </div>
                <p className={`text-gray-600 leading-relaxed text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {isRTL
                    ? 'ننفذ وندير الأعمال بداية من الفكرة وتطويرها وإدارتها وحتى تنفيذها بأعلى المعايير على يد فريق عمل من المتخصصين في كافة المجالات الإبداعية والفنية'
                    : 'We execute and manage projects from the initial idea, through development and management, to implementation with the highest standards by a team of specialists in all creative and artistic fields.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TuraStyleSection;
