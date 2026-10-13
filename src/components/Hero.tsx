'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Youtube, Linkedin, MessageCircle } from 'lucide-react';

// X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Hero = () => {
  const { t, isRTL } = useLanguage();
  const { ref: heroRef, isVisible: isHeroVisible } = useScrollAnimation({
    threshold: 0.01,
    rootMargin: '0px 0px 120px 0px'
  });

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const titleText = isRTL ? 'إبداع يزين فضائك...' : 'Creativity decorates your space...';
  const descriptionText = isRTL 
    ? 'نحن شركة سعودية للإنتاج المرئي تحلق بأفكارها نحو فضاء الإلهام. كل قصة إلى حكاية تنبض بالحياة، وكل فكرة تترك أثرا، نحن لا ننتج فحسب، بل نحكي و نرسم، و نضيء.'
    : 'We are a Saudi visual production company that soars with its ideas toward the space of inspiration. Every story is a tale that pulsates with life, and every idea leaves an impact. We don\'t just produce, we narrate we draw, and we illuminate.';

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/headers/banner.MP4" type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')"
            }}
          />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>


      {/* Content */}
      <div className="relative z-10 w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-end min-h-screen pb-20">
          <div className={`max-w-4xl ${isRTL ? 'text-right ml-auto' : 'text-left'}`}>
            

            {/* Title with Slide-in Animation (Right to Left) */}
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight ${isRTL ? 'font-arabic' : 'font-english'} ${isHeroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40px]'}`} style={{ transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.05s' }}>
              {titleText}
            </h1>
            
            
            {/* Description with Slide-in Animation (Left to Right) */}
            <p className={`text-lg md:text-xl text-white/90 mb-12 leading-relaxed max-w-3xl ${isRTL ? 'font-arabic' : 'font-english'} ${isHeroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-40px]'}`} style={{ transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.12s' }}>
              {descriptionText}
            </p>
            
            {/* Modern Glass CTA Button with Slide-in Animation (Bottom to Top) */}
            <div className={`${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'}`} style={{ transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0.18s' }}>
              <button
                onClick={scrollToContact}
                className={`group relative inline-flex items-center gap-3 px-8 py-4 
                  bg-white/10 backdrop-blur-md border border-white/20 
                  hover:bg-red-500/20 hover:border-red-400/30 
                  text-white hover:text-white
                  rounded-2xl text-lg font-semibold 
                  transition-all duration-500 transform hover:scale-105 
                  hover:shadow-2xl hover:shadow-red-500/25
                  ${isRTL ? 'font-arabic' : 'font-english'}
                  before:absolute before:inset-0 before:rounded-2xl 
                  before:bg-gradient-to-r before:from-white/5 before:to-transparent 
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
                  overflow-hidden`}
              >
                <span className="relative z-10">{t('hero.cta')}</span>
                <MessageCircle className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                
                {/* Glass reflection effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Social Media Icons */}
      <div className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 transform -translate-y-1/2 z-10 hidden lg:block`}>
        <div className="flex flex-col space-y-6">
          <a href="https://www.instagram.com/orbia.sa?igsh=ZjRkcnYxbWpoeDk3" target="_blank" rel="noopener noreferrer" className="group text-white hover:text-orbia-pink transition-all duration-300 transform hover:scale-110">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-orbia-pink/20 transition-colors duration-300">
              <Instagram className="w-6 h-6" />
            </div>
          </a>
          <a href="https://x.com/orbiasa_" target="_blank" rel="noopener noreferrer" className="group text-white hover:text-orbia-pink transition-all duration-300 transform hover:scale-110">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-orbia-pink/20 transition-colors duration-300">
              <XIcon className="w-6 h-6" />
            </div>
          </a>
          <a href="#" className="group text-white hover:text-orbia-pink transition-all duration-300 transform hover:scale-110">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-orbia-pink/20 transition-colors duration-300">
              <Youtube className="w-6 h-6" />
            </div>
          </a>
          <a href="#" className="group text-white hover:text-orbia-pink transition-all duration-300 transform hover:scale-110">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-orbia-pink/20 transition-colors duration-300">
              <Linkedin className="w-6 h-6" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
