import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Manga } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCoverUrl(manga: Manga, size: '256' | '512' | 'original' = '512'): string {
  if (!manga) return 'https://placehold.co/400x600/080505/991B1B?text=No+Data';
  
  const coverRel = manga.relationships?.find(rel => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  
  if (!fileName) {
    // If no cover_art relationship is present with attributes, check if we have it in some other form or use placeholder
    return 'https://placehold.co/400x600/080505/991B1B?text=No+Cover';
  }
  
  const suffix = size === 'original' ? '' : `.${size}.jpg`;
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}${suffix}`;
}

export function getMangaTitle(manga: Manga): string {
  if (!manga?.attributes?.title) return 'Unknown Title';
  return manga.attributes.title.en || manga.attributes.title.ja || manga.attributes.title['ja-ro'] || Object.values(manga.attributes.title)[0] || 'Unknown Title';
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return 'Recently';
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
