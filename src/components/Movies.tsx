'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const getYouTubeVideoId = (rawUrl: string): string | null => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || null;
    }
  } catch {
    return null;
  }

  return null;
};

const getGoogleDriveFileId = (rawUrl: string): string | null => {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== 'drive.google.com') return null;

    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    return fileMatch?.[1] || url.searchParams.get('id');
  } catch {
    return null;
  }
};

// Component to show video thumbnails with hybrid approach
const VideoThumbnail: React.FC<{ 
  videoUrl: string; 
  title: string; 
  fallbackThumbnail: string;
  customThumbnail?: string;
  onThumbnailGenerated?: (thumbnail: string) => void;
}> = ({ videoUrl, title, fallbackThumbnail, customThumbnail, onThumbnailGenerated }) => {
  const [thumbnail, setThumbnail] = useState(customThumbnail || fallbackThumbnail);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [attemptClientSide, setAttemptClientSide] = useState(false);

  // Use custom thumbnail if available, otherwise try server-side generation
  useEffect(() => {
    if (customThumbnail) {
      setThumbnail(customThumbnail);
      setHasGenerated(true);
      console.log('✅ Using custom uploaded thumbnail:', customThumbnail);
      return;
    }
    
    if (!videoUrl.includes('dropbox.com') || hasGenerated) {
      return;
    }

    setIsGenerating(true);

    const generateServerThumbnail = async () => {
      try {
        console.log('Requesting server-side thumbnail generation...');
        
        const response = await fetch('/api/generate-thumbnail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
        });

        const result = await response.json();
        
        if (result.success && result.thumbnailUrl && !result.isRealThumbnail) {
          console.log('Server contextual thumbnail generated:', result.thumbnailUrl);
          setThumbnail(result.thumbnailUrl);
          // Don't set hasGenerated=true yet, we want to try client-side extraction
          
          // Try client-side as backup for real thumbnail
          setAttemptClientSide(true);
          
          if (onThumbnailGenerated) {
            onThumbnailGenerated(result.thumbnailUrl);
          }
        } else if (result.success && result.isRealThumbnail) {
          console.log('Real server thumbnail generated:', result.thumbnailUrl);
          setThumbnail(result.thumbnailUrl);
          setHasGenerated(true);
          
          if (onThumbnailGenerated) {
            onThumbnailGenerated(result.thumbnailUrl);
          }
        } else {
          console.log('Server thumbnail generation failed, trying client-side');
          setAttemptClientSide(true);
        }
      } catch (error) {
        console.log('Server thumbnail request failed, trying client-side:', error);
        setAttemptClientSide(true);
      } finally {
        setIsGenerating(false);
      }
    };

    const timeout = setTimeout(generateServerThumbnail, 500);
    return () => clearTimeout(timeout);
  }, [videoUrl, hasGenerated, onThumbnailGenerated, customThumbnail]);

  // Try enhanced server-side extraction as backup
  useEffect(() => {
    if (!attemptClientSide || hasGenerated) {
      return;
    }

    console.log('Attempting enhanced server-side frame extraction...');
    setIsGenerating(true);

    const extractFrame = async () => {
      try {
        const response = await fetch('/api/extract-frame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            videoUrl,
            seekTime: 3 
          }),
        });

        const result = await response.json();
        
        if (result.success && result.thumbnailUrl) {
          console.log('✅ Enhanced server-side thumbnail generated:', result.method);
          setThumbnail(result.thumbnailUrl);
          setHasGenerated(true);
          
          if (onThumbnailGenerated) {
            onThumbnailGenerated(result.thumbnailUrl);
          }
          
          console.log('Video info:', result.videoInfo);
        } else {
          console.log('Enhanced server extraction failed:', result.error);
          setHasGenerated(true);
        }
      } catch (error) {
        console.log('Enhanced server extraction request failed:', error);
        setHasGenerated(true);
      } finally {
        setIsGenerating(false);
      }
    };

    // Small delay to avoid blocking UI
    const timeout = setTimeout(extractFrame, 1000);
    
    return () => clearTimeout(timeout);
  }, [attemptClientSide, hasGenerated, onThumbnailGenerated, videoUrl]);

  return (
    <div className="relative w-full h-full">
      <img 
        src={thumbnail} 
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      
      {/* Loading state overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {/* Video play overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/30 backdrop-blur-sm rounded-full p-3">
          <Play className="w-8 h-8 text-white/90" />
        </div>
      </div>
    </div>
  );
};

const Movies = () => {
  const { t, isRTL } = useLanguage();
  const { ref: moviesRef, isVisible: isMoviesVisible } = useScrollAnimation({
    threshold: 0.12,
    rootMargin: '0px 0px -12% 0px'
  });
  const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>({
    advertisements: 4,
    documentary: 4,
    coverage: 4,
  });

  const categories = [
    { 
      key: 'advertisements', 
      title: { ar: 'الاعلانات المرئية', en: 'Visual Advertisements' },
      description: {
        ar: 'نقدم إعلانات مرئية احترافية ومبتكرة تجذب الجمهور وتوصل رسالتك بشكل فعال ومؤثر.',
        en: 'We provide professional and innovative visual advertisements that attract audiences and deliver your message effectively and impactfully.'
      }
    },
    { 
      key: 'documentary', 
      title: { ar: 'أفلام وثائقية', en: 'Documentary Films' },
      description: {
        ar: 'نؤمن في أوربيا بأن الوثائقيات تخليد للذاكرة، وأجمل سرد للذكرى، وهي الوسيلة للاحتفاء بالإرث الشخصي أو المؤسسي، وهي كذلك خيارنا لحفظ موروثنا الثقافي ومشاركته مع العالم من خلال توظيف تقنيات التصوير وجماليات السرد لنصنع لك الوثائقي الأجمل.',
        en: 'We believe at Orbia that documentaries are a commemoration of memory, and the most beautiful narration of memory, and they are the means to celebrate personal or institutional heritage, and they are also our choice to preserve our cultural heritage and share it with the world.'
      }
    },
    { 
      key: 'coverage', 
      title: { ar: 'تغطية الفعاليات', en: 'Events Coverage' },
      description: {
        ar: 'نقدم تغطية شاملة ومبتكرة للأحداث والفعاليات، مع التركيز على جودة الإنتاج والقدرة على إيصال الفكرة بشكل مؤثر.',
        en: 'We provide comprehensive and innovative coverage of events and activities, focusing on production quality and the ability to deliver ideas effectively.'
      }
    }
  ];

  // Dynamic data fetched from API (fallback to sample if empty)
  const sampleVideos = {
    advertisements: [
      { id: 1, title: 'إعلان تجاري', duration: '00:30', thumbnail: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'إعلان منتج', duration: '00:45', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'إعلان خدمي', duration: '00:35', thumbnail: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'إعلان ترويجي', duration: '00:50', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'إعلان رقمي', duration: '00:40', thumbnail: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 6, title: 'إعلان علامة تجارية', duration: '01:00', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 7, title: 'إعلان مؤسسي', duration: '00:55', thumbnail: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 8, title: 'إعلان توعوي', duration: '00:45', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 9, title: 'إعلان إبداعي', duration: '01:10', thumbnail: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
    ],
    documentary: [
      { id: 1, title: 'حرفة البناء التقليدي', duration: '06:16', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'حرفة صناعة العقال', duration: '02:06', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'حرفة الصياغة', duration: '03:08', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'حرفة النقش على الخشب', duration: '02:40', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'حرفة النسيج التقليدي', duration: '04:12', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 6, title: 'حرفة الفخار', duration: '03:45', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 7, title: 'حرفة الحدادة', duration: '05:30', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 8, title: 'حرفة الخياطة', duration: '02:15', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 9, title: 'حرفة النجارة', duration: '04:50', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
    ],
    coverage: [
      { id: 1, title: '#أنتم_درعنا', duration: '00:57', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'عسل التار', duration: '00:28', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'الحالمين', duration: '02:20', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'عسيب', duration: '00:58', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'مشروع المستقبل', duration: '01:15', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 6, title: 'رؤية 2030', duration: '01:45', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 7, title: 'الابتكار', duration: '02:10', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 8, title: 'التميز', duration: '01:30', thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
      { id: 9, title: 'الريادة', duration: '01:55', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
    ]
  };

  type DbVideo = { id: string; category: string; title_ar: string; title_en: string; video_url: string; thumbnail_url?: string };
  type VideoItem = { id: string | number; title: string; duration: string; thumbnail: string; customThumbnail?: string; video_url?: string };
  const [dbVideos, setDbVideos] = useState<DbVideo[]>([]);
  const [player, setPlayer] = useState<{ open: boolean; url: string; title: string }>(() => ({ open: false, url: '', title: '' }));
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/movies').then(r => r.json()).then(setDbVideos).catch(() => {});
  }, []);

  // Preload video metadata for faster playback
  const preloadVideo = (videoUrl: string) => {
    if (preloadedVideos.has(videoUrl)) return;
    if (getYouTubeVideoId(videoUrl) || getGoogleDriveFileId(videoUrl) || videoUrl.includes('vimeo.com')) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const playableUrl = toPlayableUrl(videoUrl);
    video.src = playableUrl;
    
    video.addEventListener('loadedmetadata', () => {
      setPreloadedVideos(prev => new Set([...prev, videoUrl]));
      console.log('Video metadata preloaded:', videoUrl, 'Duration:', video.duration);
    });

    video.addEventListener('error', (e) => {
      console.log('Video preload failed:', videoUrl, e);
    });

    // Load metadata
    video.load();
  };

  const getVideoThumbnail = (videoUrl: string): string => {
    // For YouTube videos
    const youtubeId = getYouTubeVideoId(videoUrl);
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    const driveFileId = getGoogleDriveFileId(videoUrl);
    if (driveFileId) return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1000`;
    
    // For Vimeo videos
    if (videoUrl.includes('vimeo.com')) {
      // For Vimeo, we'll use a generic video thumbnail since extracting thumbnails requires API
      return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80';
    }
    
    // For Dropbox videos, we'll generate the thumbnail dynamically using a video element
    if (videoUrl.includes('dropbox.com')) {
      // Return a placeholder that will be replaced by the actual video frame
      return `data:image/svg+xml,${encodeURIComponent(`
        <svg width="500" height="280" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1f2937"/>
          <g fill="white" transform="translate(250,140)">
            <circle r="30" fill="#ef4444" opacity="0.9"/>
            <polygon points="-10,-10 -10,10 15,0" fill="white"/>
          </g>
          <text x="250" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Loading video preview...</text>
        </svg>
      `)}`;
    }
    
    // For other direct video links, use a generic video thumbnail
    return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80';
  };

  const mergedVideos = (key: keyof typeof sampleVideos): VideoItem[] => {
    const filtered = dbVideos.filter((v) => v.category === key);
    if (filtered.length) {
      return filtered.map((v, idx: number) => ({ 
        id: v.id ?? idx, 
        title: isRTL ? v.title_ar : v.title_en, 
        duration: '', 
        thumbnail: v.thumbnail_url || getVideoThumbnail(v.video_url),
        customThumbnail: v.thumbnail_url,
        video_url: v.video_url || ''
      }));
    }
    return sampleVideos[key].map(v => ({ ...v, video_url: undefined }));
  };

  const toPlayableUrl = (raw: string): string => {
    console.log('Processing video URL:', raw);
    
    if (/dropbox\.com/.test(raw)) {
      // Try direct Dropbox URLs first, fallback to proxy if needed
      let processedUrl = raw
        .replace('?dl=0', '?dl=1')
        .replace('&dl=0', '&dl=1')
        .replace('?raw=0', '?raw=1')
        .replace('&raw=0', '&raw=1');
      
      if (!processedUrl.includes('dl=1') && !processedUrl.includes('raw=1')) {
        const separator = processedUrl.includes('?') ? '&' : '?';
        processedUrl = processedUrl + separator + 'raw=1';
      }
      
      console.log('Using direct Dropbox URL:', processedUrl);
      return processedUrl;
    }
    
    // Handle YouTube URLs
    if (getYouTubeVideoId(raw)) {
      console.log('YouTube URL detected, returning as-is for embed handling');
      return raw;
    }
    
    // Handle Vimeo URLs
    if (raw.includes('vimeo.com/')) {
      console.log('Vimeo URL detected, returning as-is for embed handling');
      return raw;
    }
    
    console.log('Non-Dropbox URL, returning as-is:', raw);
    return raw;
  };

  const handleLoadMore = (key: keyof typeof sampleVideos) => {
    const total = sampleVideos[key].length;
    setVisibleCounts((prev) => {
      const current = prev[key as string] ?? 4;
      return { ...prev, [key]: Math.min(total, current + 4) };
    });
  };

  return (
    <section ref={moviesRef} id="movies" className="relative z-10 bg-white overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Enhanced Section Title */}
        <div className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className={`reveal-soft text-4xl md:text-5xl lg:text-6xl font-bold text-orbia-pink mb-6 ${isRTL ? 'font-arabic' : 'font-english'} ${isMoviesVisible ? 'reveal-soft-visible' : ''}`}>
            {isRTL ? 'أعمال الانتاج المرئي' : 'Visual Production Works'}
          </h2>
        </div>

        {(categories as typeof categories).map((category, categoryIndex) => {
          const key = category.key as keyof typeof sampleVideos;
          const videos = mergedVideos(key);
          const visible = visibleCounts[key as string] ?? 4;
			return (
				<div key={category.key} id={`cat-${category.key}`} className={`reveal-soft mb-32 ${isMoviesVisible ? 'reveal-soft-visible' : ''}`} style={{ transitionDelay: `${0.08 + (categoryIndex * 0.08)}s` }}>
            {/* Enhanced Category Header */}
            <div className={`mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-baseline justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap sm:flex-nowrap`}>
                  <span className="shrink-0 text-gray-800">
                    {isRTL ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </span>
                  <h3 className={`shrink-0 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? category.title.ar : category.title.en}
                  </h3>
                  <p className={`text-justify text-[13px] sm:text-sm md:text-sm lg:text-base text-gray-600 leading-relaxed ${isRTL ? 'font-arabic [text-align-last:right]' : 'font-english [text-align-last:left]'} max-w-[42ch] sm:max-w-[48ch] lg:max-w-[52ch]`}>
                    {isRTL ? category.description.ar : category.description.en}
                  </p>
              </div>
            </div>

          {/* Enhanced Video Grid */}
          <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] max-w-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
              {videos.slice(0, visible).map((video, videoIndex) => (
                <div key={String(video.id)} className="group">
                  <div className="relative">
                    {/* Enhanced Video Card */}
                    <div 
                      className="relative aspect-video rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100"
                      onMouseEnter={() => {
                        // Preload video on hover for faster playback
                        if (video.video_url) {
                          preloadVideo(video.video_url);
                        }
                      }}
                    >
                      
                      {/* Video Thumbnail */}
                      <VideoThumbnail
                        videoUrl={video.video_url || ''}
                        title={video.title}
                        fallbackThumbnail={video.thumbnail}
                        customThumbnail={video.customThumbnail}
                      />
                      
                      {/* Enhanced Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-orbia-pink/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <button onClick={()=>{
                            const originalUrl = video.video_url || 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4';
                            const playableUrl = toPlayableUrl(originalUrl);
                            // Store original URL for error handling
                            (window as typeof window & { currentVideoUrl?: string }).currentVideoUrl = originalUrl;
                            setPlayer({ open:true, url: playableUrl, title: String(video.title) });
                          }} className="relative w-16 h-16 bg-gradient-to-br from-orbia-pink to-orbia-pink/80 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {video.duration}
                      </div>

                    </div>
                    
                    {/* Enhanced Video Title */}
                    <h5 className={`mt-4 text-lg font-semibold text-gray-800 group-hover:text-orbia-pink transition-colors duration-300 ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}>
                      {video.title}
                    </h5>
                  </div>
                  </div>
              ))}
            </div>
          </div>

            {/* Enhanced Load More Button */}
            {visible < videos.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => handleLoadMore(key)}
                  className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-orbia-pink text-orbia-pink rounded-2xl font-semibold transition-all duration-500 hover:bg-orbia-pink hover:text-white hover:scale-105 hover:shadow-2xl ${isRTL ? 'font-arabic' : 'font-english'}`}
                >
                  <span>{isRTL ? 'تحميل المزيد' : 'Load more'}</span>
                  <div className="w-2 h-2 bg-orbia-pink rounded-full group-hover:bg-white transition-colors duration-300" />
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
      {player.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6" onClick={()=>setPlayer({ open:false, url:'', title:'' })}>
          <div className="relative w-full max-w-5xl" onClick={(e)=>e.stopPropagation()}>
            {/* Close Button */}
            <button 
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors duration-200 z-10" 
              onClick={()=>setPlayer({ open:false, url:'', title:'' })}
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Video Container */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
              {getYouTubeVideoId(player.url) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(player.url)}?autoplay=1&rel=0`}
                  title={player.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : getGoogleDriveFileId(player.url) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://drive.google.com/file/d/${getGoogleDriveFileId(player.url)}/preview`}
                  title={player.title}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
              <video
                controls 
                playsInline 
                autoPlay
                preload="auto"
                className="w-full h-full object-contain"
                src={player.url}
                onLoadStart={() => {
                  console.log('Video loading started:', player.url);
                }}
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  console.log('Video metadata loaded - Duration:', video.duration, 'seconds');
                }}
                onCanPlay={() => {
                  console.log('Video can start playing:', player.url);
                }}
                onCanPlayThrough={() => {
                  console.log('Video can play through without buffering:', player.url);
                }}
                onDurationChange={(e) => {
                  const video = e.target as HTMLVideoElement;
                  console.log('Video duration changed to:', video.duration, 'seconds');
                }}
                onError={(e) => {
                  console.error('Video playback error:', e);
                  console.error('Failed URL:', player.url);
                  
                  const video = e.target as HTMLVideoElement;
                  const originalUrl = (window as typeof window & { currentVideoUrl?: string }).currentVideoUrl || player.url;
                  
                  // Try fallback URLs for Dropbox videos
                  if (originalUrl.includes('dropbox.com') && !video.src.includes('raw=1')) {
                    console.log('Trying fallback with raw=1 parameter');
                    const fallbackUrl = originalUrl.includes('?') 
                      ? originalUrl.replace('dl=1', 'raw=1') 
                      : originalUrl + '?raw=1';
                    
                    video.src = fallbackUrl;
                    video.load();
                    return;
                  }
                  
                  // Show user-friendly error message
                  const errorContainer = video.parentElement;
                  if (errorContainer) {
                    errorContainer.innerHTML = `
                      <div class="flex flex-col items-center justify-center h-full text-white p-8 text-center">
                        <div class="text-red-400 mb-4">
                          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
                          </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">${isRTL ? 'خطأ في تشغيل الفيديو' : 'Video Playback Error'}</h3>
                        <p class="text-sm text-gray-300 mb-4">
                          ${isRTL 
                            ? 'لم نتمكن من تشغيل هذا الفيديو. قد يكون الرابط غير صحيح أو منتهي الصلاحية'
                            : 'Unable to play this video. The link may be invalid or expired'
                          }
                        </p>
                        <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" 
                           class="inline-flex items-center px-4 py-2 bg-orbia-pink hover:bg-orbia-pink/80 text-white rounded-lg transition-colors duration-200">
                          ${isRTL ? 'فتح في Dropbox' : 'Open in Dropbox'}
                        </a>
                      </div>
                    `;
                  }
                }}
              >
                <source src={player.url} type="video/mp4" />
                <source src={player.url} type="video/webm" />
                <source src={player.url} type="video/ogg" />
                <p className="text-white p-8 text-center">
                  {isRTL 
                    ? 'متصفحك لا يدعم تشغيل الفيديو. يمكنك تحميل الفيديو من الرابط أدناه'
                    : 'Your browser does not support the video tag. You can download the video from the link below'
                  }
                  <br />
                  <a href={player.url} target="_blank" rel="noopener noreferrer" className="text-orbia-pink hover:underline">
                    {isRTL ? 'تحميل الفيديو' : 'Download Video'}
                  </a>
                </p>
              </video>
              )}
            </div>
            
            {/* Video Title */}
            <div className={`mt-4 text-white text-lg font-medium ${isRTL ? 'text-right font-arabic' : 'text-left font-english'}`}>
              {player.title}
            </div>
            
            {/* Video URL for debugging (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-white/50 text-xs break-all">
                URL: {player.url}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Movies;
