import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Manga } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncates text to a specific length and adds ellipsis
 */
export function truncateTitle(title: string, maxLength: number = 40): string {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength).trim() + '...';
}

/**
 * Chunks an array into smaller arrays of a specific size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function getCoverUrl(manga: Manga, size: '256' | '512' | 'original' = '512'): string {
  if (!manga) return 'https://placehold.co/400x600/0a0a0f/6366f1?text=No+Data';
  
  const coverRel = manga.relationships?.find(rel => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  
  if (!fileName) {
    return 'https://placehold.co/400x600/0a0a0f/6366f1?text=No+Cover';
  }
  
  const suffix = size === 'original' ? '' : `.${size}.jpg`;
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}${suffix}`;
}

export function getMangaTitle(manga: Manga): string {
  if (!manga?.attributes?.title) return 'Unknown Title';
  const t = manga.attributes.title;
  return t.id || t.en || t.ja || t['ja-ro'] || Object.values(t)[0] || 'Unknown Title';
}

export function getMangaDescription(manga: Manga): string {
  if (!manga?.attributes?.description) return 'Synchronizing data summary...';
  const desc = manga.attributes.description;
  const text = desc.id || desc.en || desc.ja || Object.values(desc)[0] || 'No summary data found.';
  return cleanDescription(text);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return 'Recently';
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 8400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function cleanDescription(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`~]/g, '')
    .trim();
}
