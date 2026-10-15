'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

const Navigation = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', href: '#home' },
    { key: 'ourServices', href: '#our-services' },
    { key: 'movies', href: '#movies' },
    { key: 'photos', href: '#photos' },
    { key: 'ourPartners', href: '#our-partners' },
    { key: 'contactUs', href: '#contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-t-4 border-orbia-pink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={isRTL ? "/icons/ar-logo.svg" : "/icons/en-logo.svg"}
              alt="ORBIA Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className={`flex items-center space-x-8 ${isRTL ? 'rtl:space-x-reverse' : ''}`}>
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className="text-white hover:text-orbia-pink transition-colors duration-200 font-arabic"
                >
                  {t(`navigation.${item.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle & Mobile Menu Button */}
          <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={toggleLanguage}
              className="text-white hover:text-orbia-pink transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-arabic">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Mobile menu button - positioned based on language */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-orbia-pink transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden absolute top-full bg-white shadow-lg border border-gray-200 ${isRTL ? 'right-0 w-64 rounded-tl-2xl' : 'left-0 w-64 rounded-tr-2xl'} rounded-b-2xl`}>
            <div className="px-4 pt-4 pb-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className={`block w-full text-black hover:text-orbia-pink hover:bg-gray-50 transition-all duration-200 py-3 px-3 rounded-lg font-arabic ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t(`navigation.${item.key}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
