'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send } from 'lucide-react';
import ScrollReveal from './anim/ScrollReveal';

const ContactUs = () => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    message: '',
    website: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'limited'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      if (res.status === 429) {
        setStatus('limited');
        return;
      }
      if (!res.ok) throw new Error('Request failed');
      setFormData({ name: '', email: '', phone: '', company: '', position: '', message: '', website: '' });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="min-h-screen relative z-10">
      <div className="absolute inset-0 bg-[url('/backgrounds/contact-us.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <ScrollReveal y={30} durationMs={650}>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-orbia-pink mb-4 font-arabic">
              {t('contact.title')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                    {t('contact.form.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                    placeholder={t('contact.form.name')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                    {t('contact.form.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                    placeholder={t('contact.form.email')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                    {t('contact.form.phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                    placeholder={t('contact.form.phone')}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                    {t('contact.form.company')} *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                    placeholder={t('contact.form.company')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                  {t('contact.form.position')}
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                  placeholder={t('contact.form.position')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2 font-arabic">
                  {t('contact.form.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orbia-pink focus:border-transparent font-arabic"
                  placeholder={t('contact.form.message')}
                />
              </div>

              {/* Honeypot: hidden from real users, bots tend to fill it */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full disabled:opacity-60 bg-orbia-pink hover:bg-orbia-pink/90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 font-arabic flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Send className="w-5 h-5" />
                <span>{t('contact.form.submit')}</span>
              </button>

              {status === 'success' && (
                <p className="text-green-400 text-center font-arabic">
                  {isRTL ? 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.' : 'Your message was sent. We will contact you soon.'}
                </p>
              )}
              {status === 'limited' && (
                <p className="text-yellow-400 text-center font-arabic">
                  {isRTL ? 'أرسلت رسائل كثيرة، حاول لاحقاً.' : 'Too many messages, please try again later.'}
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-center font-arabic">
                  {isRTL ? 'حدث خطأ، حاول مرة أخرى.' : 'Something went wrong, please try again.'}
                </p>
              )}
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ContactUs;