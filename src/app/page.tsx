'use client';

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import TuraStyleSection from '@/components/TuraStyleSection';
import OurServices from '@/components/OurServices';
import Movies from '@/components/Movies';
import Photos from '@/components/Photos';
import OurPartners from '@/components/OurPartners';
import ContactUs from '@/components/ContactUs';

export default function Home() {
  return (
    <LanguageProvider>
      <Layout>
        <Hero />
        <TuraStyleSection />
        <OurServices />
        <Movies />
        <Photos />
        <OurPartners />
        <ContactUs />
      </Layout>
    </LanguageProvider>
  );
}