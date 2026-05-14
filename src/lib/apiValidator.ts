/**
 * @fileOverview Data Validation Protocol
 * Ensures all incoming API signals meet the NoirManhwa system specifications.
 */

import { Manga, Chapter } from '@/types/manga';

export function validateMangaData(data: any): data is Manga[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item.id === 'string' && 
    typeof item.title === 'string' && 
    typeof item.cover === 'string'
  );
}

export function validateChapterData(data: any): data is Chapter[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item.id === 'string' && 
    typeof item.number === 'string'
  );
}

export function sanitizeManga(item: any, source: string): Manga {
  // Generate a reliable ID fallback to prevent duplicate keys in UI
  const generatedId = item.id || item.slug || (item.ID ? String(item.ID) : `manga-${Math.random().toString(36).substr(2, 9)}`);

  return {
    id: generatedId,
    title: item.title || item.post_title || 'Unknown Title',
    cover: item.cover || item.thumbnail || item.featured_image || 'https://picsum.photos/seed/manga/400/600',
    status: item.status || 'Ongoing',
    genres: Array.isArray(item.genres) ? item.genres : [],
    source: source as any,
    language: source === 'komiku' ? 'id' : 'en',
    description: item.description || item.post_content || '',
    rating: parseFloat(item.rating || item.score) || 0,
    type: item.type || 'manhwa'
  };
}
