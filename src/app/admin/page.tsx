'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MovieCategory, PhotoCategory, MovieRow, PhotoRow } from '@/lib/db';
import { Plus, Edit, Trash2, Film, Image, Save, X, Upload, LogOut, Globe } from 'lucide-react';

interface CategoryData {
  slug: string;
  name_ar: string;
  name_en: string;
}

const AdminPage: React.FC = () => {
  const { isRTL, toggleLanguage } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [movieCats, setMovieCats] = useState<CategoryData[]>([]);
  const [photoCats, setPhotoCats] = useState<CategoryData[]>([]);
  const [loadError, setLoadError] = useState('');
  
  // Modal states
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieRow | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoRow | null>(null);

  const [movie, setMovie] = useState({
    category: 'advertisements' as MovieCategory,
    title_ar: '',
    title_en: '',
    video_url: ''
  });
  
  const [photo, setPhoto] = useState({
    category: 'coverage' as PhotoCategory,
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    file: null as File | null
  });

  const call = async (path: string, body: FormData) => {
    setBusy(true);
    try {
      const res = await fetch(path, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/admin/movies'),
        fetch('/api/admin/photos'),
        fetch('/api/admin/categories'),
      ]);
      const [m, p, c] = await Promise.all(responses.map(response => response.json().catch(() => null)));

      setMovies(Array.isArray(m) ? m : []);
      setPhotos(Array.isArray(p) ? p : []);
      setMovieCats(Array.isArray(c?.movies) ? c.movies : []);
      setPhotoCats(Array.isArray(c?.photos) ? c.photos : []);

      if (responses.some(response => !response.ok)) {
        setLoadError(isRTL
          ? 'تعذر تحميل المحتوى. تأكد من إضافة DATABASE_URL في إعدادات Vercel.'
          : 'Content could not be loaded. Make sure DATABASE_URL is configured in Vercel.');
      } else {
        setLoadError('');
      }
    } catch (error) {
      console.error('Error refreshing data', error);
      setMovies([]);
      setPhotos([]);
      setMovieCats([]);
      setPhotoCats([]);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل المحتوى.' : 'An error occurred while loading content.');
    }
  };

  useEffect(() => { refresh(); }, []);

  const resetMovieForm = () => {
    setMovie({
      category: 'advertisements' as MovieCategory,
      title_ar: '',
      title_en: '',
      video_url: ''
    });
    setEditingMovie(null);
  };

  const resetPhotoForm = () => {
    setPhoto({
      category: 'coverage' as PhotoCategory,
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      file: null
    });
    setEditingPhoto(null);
  };

  const submitMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    const fd = new FormData();
    Object.entries(movie).forEach(([k, v]) => fd.append(k, String(v)));
      
      if (editingMovie) {
        fd.append('id', editingMovie.id);
      }
      
      // Add thumbnail file if selected
      const thumbnailInput = document.getElementById('movie-thumbnail') as HTMLInputElement;
      const thumbnailFile = (thumbnailInput as HTMLInputElement & { movieThumbnailFile?: File })?.movieThumbnailFile;
      if (thumbnailFile) {
        fd.append('thumbnail', thumbnailFile);
      }
      
    await call('/api/admin/movies', fd);
    await refresh();
      setShowMovieModal(false);
      resetMovieForm();
      alert(editingMovie ? 'Movie updated successfully!' : 'Movie added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error saving movie');
    }
  };

  const submitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    const fd = new FormData();
    fd.append('category', photo.category);
    fd.append('title_ar', photo.title_ar);
    fd.append('title_en', photo.title_en);
    fd.append('description_ar', photo.description_ar);
    fd.append('description_en', photo.description_en);
      
    if (photo.file) fd.append('file', photo.file);
      if (editingPhoto) fd.append('id', editingPhoto.id);
      
    await call('/api/admin/photos', fd);
    await refresh();
      setShowPhotoModal(false);
      resetPhotoForm();
      alert(editingPhoto ? 'Photo updated successfully!' : 'Photo added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error saving photo');
    }
  };

  const editMovie = (movieData: MovieRow) => {
    setEditingMovie(movieData);
    setMovie({
      category: movieData.category,
      title_ar: movieData.title_ar,
      title_en: movieData.title_en,
      video_url: movieData.video_url
    });
    setShowMovieModal(true);
  };

  const editPhoto = (photoData: PhotoRow) => {
    setEditingPhoto(photoData);
    setPhoto({
      category: photoData.category,
      title_ar: photoData.title_ar,
      title_en: photoData.title_en,
      description_ar: photoData.description_ar,
      description_en: photoData.description_en,
      file: null
    });
    setShowPhotoModal(true);
  };

  const deleteMovie = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
      await refresh();
      alert('Movie deleted successfully!');
    } catch {
      alert('Error deleting movie');
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
      await refresh();
      alert('Photo deleted successfully!');
    } catch {
      alert('Error deleting photo');
    }
  };

  const openMovieModal = () => {
    resetMovieForm();
    setShowMovieModal(true);
  };

  const openPhotoModal = () => {
    resetPhotoForm();
    setShowPhotoModal(true);
  };

  const handleLogout = () => {
    if (confirm(isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?')) {
      // Clear admin cookie and redirect to login
      document.cookie = 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className={`min-h-screen bg-black text-white relative ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{background: '#000000'}}>
      {/* Override global background */}
      <div className="fixed inset-0 bg-black z-[-1]" />
      {loadError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
            {loadError}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b border-gray-800 bg-black backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {isRTL ? 'لوحة تحكم أوربيا' : 'Orbia Admin Control Panel'}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                {isRTL ? 'إدارة محتوى الأفلام والصور' : 'Manage your movies and photos content'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={isRTL ? 'تغيير اللغة' : 'Change Language'}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{isRTL ? 'EN' : 'عربي'}</span>
              </button>
              
              {/* Home Button */}
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                title={isRTL ? 'العودة للموقع' : 'Back to Website'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">{isRTL ? 'الموقع' : 'Home'}</span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                title={isRTL ? 'تسجيل الخروج' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{isRTL ? 'خروج' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={openPhotoModal}
              className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`relative flex items-center justify-center space-x-4 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Image className="w-8 h-8" />
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-semibold">
                  {isRTL ? 'إضافة مشروع صور' : 'Add Photo Project'}
                </h3>
                <p className="text-red-100 text-sm mt-1">
                  {isRTL ? 'إنشاء مشروع صور جديد مع الصور' : 'Create a new photo entry with images'}
                </p>
              </div>
              <Plus className={`w-6 h-6 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
            </div>
          </button>

          <button
            onClick={openMovieModal}
            className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`relative flex items-center justify-center space-x-4 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Film className="w-8 h-8" />
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-semibold">
                  {isRTL ? 'إضافة مشروع أفلام' : 'Add Movie Project'}
                </h3>
                <p className="text-red-100 text-sm mt-1">
                  {isRTL ? 'إنشاء مشروع فيلم جديد مع محتوى الفيديو' : 'Create a new movie entry with video content'}
                </p>
              </div>
              <Plus className={`w-6 h-6 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
            </div>
          </button>
        </div>

        {/* Content Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photos Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold flex items-center space-x-2 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Image className="w-6 h-6 text-red-400" />
                <span>{isRTL ? `الصور (${photos.length})` : `Photos (${photos.length})`}</span>
              </h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا توجد صور بعد. أضف مشروع الصور الأول!' : 'No photos yet. Add your first photo project!'}</p>
                </div>
              ) : (
                photos.map((photoItem) => (
                  <div key={photoItem.id} className="bg-black/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{isRTL ? photoItem.title_ar : photoItem.title_en}</h3>
                        <p className="text-gray-300 text-sm">{isRTL ? photoItem.title_en : photoItem.title_ar}</p>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{isRTL ? photoItem.description_ar : photoItem.description_en}</p>
                            <span className="inline-block bg-red-600/20 text-red-300 text-xs px-2 py-1 rounded mt-2">
                          {photoCats.find(cat => cat.slug === photoItem.category)?.[isRTL ? 'name_ar' : 'name_en'] || photoItem.category}
                        </span>
                      </div>
                      <div className={`flex space-x-2 rtl:space-x-reverse ${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <button
                          onClick={() => editPhoto(photoItem)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePhoto(photoItem.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Movies Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold flex items-center space-x-2 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Film className="w-6 h-6 text-blue-400" />
                <span>{isRTL ? `الأفلام (${movies.length})` : `Movies (${movies.length})`}</span>
              </h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {movies.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا توجد أفلام بعد. أضف مشروع الفيلم الأول!' : 'No movies yet. Add your first movie project!'}</p>
                </div>
              ) : (
                movies.map((movieItem) => (
                  <div key={movieItem.id} className="bg-black/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{isRTL ? movieItem.title_ar : movieItem.title_en}</h3>
                        <p className="text-gray-300 text-sm">{isRTL ? movieItem.title_en : movieItem.title_ar}</p>
                        <span className="inline-block bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded mt-2">
                          {movieCats.find(cat => cat.slug === movieItem.category)?.[isRTL ? 'name_ar' : 'name_en'] || movieItem.category}
                        </span>
                      </div>
                      <div className={`flex space-x-2 rtl:space-x-reverse ${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <button
                          onClick={() => editMovie(movieItem)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMovie(movieItem.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h2 className={`text-2xl font-bold flex items-center space-x-2 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Film className="w-6 h-6 text-red-400" />
                    <span>
                      {editingMovie 
                        ? (isRTL ? 'تعديل فيلم' : 'Edit Movie') 
                        : (isRTL ? 'إضافة فيلم جديد' : 'Add New Movie')
                      }
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowMovieModal(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title={isRTL ? 'إغلاق' : 'Close'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            
            <form onSubmit={submitMovie} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الفئة' : 'Category'}
                  </label>
                  <select
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={movie.category}
                    onChange={(e) => setMovie({ ...movie, category: e.target.value as MovieCategory })}
                    required
                  >
                    {movieCats.map(mc => (
                      <option key={mc.slug} value={mc.slug}>
                        {isRTL ? `${mc.name_ar} / ${mc.name_en}` : `${mc.name_en} / ${mc.name_ar}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'رابط الفيديو' : 'Video URL'}
                  </label>
                  <input
                    type="url"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={isRTL ? 'رابط Dropbox أو YouTube/Vimeo' : 'https://dropbox.com/... or YouTube/Vimeo URL'}
                    value={movie.video_url}
                    onChange={(e) => setMovie({ ...movie, video_url: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Thumbnail Upload Section */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'صورة مصغرة للفيديو (اختيارية)' : 'Video Thumbnail (Optional)'}
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    id="movie-thumbnail"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Store the file for form submission
                        (e.target as HTMLInputElement & { movieThumbnailFile?: File }).movieThumbnailFile = file;
                        // Show preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const preview = document.getElementById('thumbnail-preview') as HTMLImageElement;
                          if (preview && e.target?.result) {
                            preview.src = e.target.result as string;
                            preview.classList.remove('hidden');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="movie-thumbnail"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400">
                      <Image className="w-8 h-8" />
                      <span className="text-sm">
                        {isRTL ? 'اختر صورة مصغرة أو اسحبها هنا' : 'Choose thumbnail or drag here'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'PNG, JPG, WEBP حتى 10MB' : 'PNG, JPG, WEBP up to 10MB'}
                    </p>
                  </label>
                  <img
                    id="thumbnail-preview"
                    className="hidden mt-4 max-w-full h-32 object-cover rounded-lg border border-gray-600"
                    alt="Thumbnail preview"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={isRTL ? 'أدخل العنوان بالإنجليزية' : 'Enter English title'}
                    value={movie.title_en}
                    onChange={(e) => setMovie({ ...movie, title_en: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={isRTL ? 'أدخل العنوان بالعربية' : 'أدخل العنوان بالعربية'}
                    value={movie.title_ar}
                    onChange={(e) => setMovie({ ...movie, title_ar: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={`flex justify-end space-x-4 rtl:space-x-reverse pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                      className={`px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {busy 
                      ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                      : editingMovie 
                        ? (isRTL ? 'تحديث الفيلم' : 'Update Movie')
                        : (isRTL ? 'إضافة فيلم' : 'Add Movie')
                    }
                  </span>
                </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <Image className="w-6 h-6 text-red-400" />
                  <span>{editingPhoto ? 'Edit Photo' : 'Add New Photo'}</span>
                </h2>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={submitPhoto} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={photo.category}
                    onChange={(e) => setPhoto({ ...photo, category: e.target.value as PhotoCategory })}
                    required
                  >
                {photoCats.map(pc => (
                  <option key={pc.slug} value={pc.slug}>{pc.name_en} / {pc.name_ar}</option>
                ))}
              </select>
            </div>
                
            <div>
                  <label className="block text-sm font-medium mb-2">Image File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-500"
                      onChange={(e) => setPhoto({ ...photo, file: e.target.files?.[0] ?? null })}
                      required={!editingPhoto}
                    />
                    <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <label className="block text-sm font-medium mb-2">Title (English)</label>
                  <input
                    type="text"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter English title"
                    value={photo.title_en}
                    onChange={(e) => setPhoto({ ...photo, title_en: e.target.value })}
                    required
                  />
            </div>
                
            <div>
                  <label className="block text-sm font-medium mb-2">Title (Arabic)</label>
                  <input
                    type="text"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="أدخل العنوان بالعربية"
                    value={photo.title_ar}
                    onChange={(e) => setPhoto({ ...photo, title_ar: e.target.value })}
                    required
                  />
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <label className="block text-sm font-medium mb-2">Description (English)</label>
                  <textarea
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Enter English description"
                    value={photo.description_en}
                    onChange={(e) => setPhoto({ ...photo, description_en: e.target.value })}
                    required
                  />
            </div>
                
            <div>
                  <label className="block text-sm font-medium mb-2">Description (Arabic)</label>
                  <textarea
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="أدخل الوصف بالعربية"
                    value={photo.description_ar}
                    onChange={(e) => setPhoto({ ...photo, description_ar: e.target.value })}
                    required
                  />
            </div>
            </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{busy ? 'Saving...' : editingPhoto ? 'Update Photo' : 'Add Photo'}</span>
                </button>
              </div>
            </form>
          </div>
      </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
