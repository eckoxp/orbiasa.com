export type MovieCategory = 'advertisements' | 'documentary' | 'coverage';
export type PhotoCategory = 'coverage' | 'products' | 'portraits' | 'ads';

export interface MovieRow {
  id: string;
  category: MovieCategory;
  title_ar: string;
  title_en: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoRow {
  id: string;
  category: PhotoCategory;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}


