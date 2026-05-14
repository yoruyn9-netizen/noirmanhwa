
import { MangaSource } from '@/types/manga';

export const FLAG_MAP: Record<string, string> = {
  'Indonesian': '🇮🇩',
  'English': '🇺🇸',
  'Japanese': '🇯🇵',
  'Korean': '🇰🇷',
  'Chinese': '🇨🇳',
  'French': '🇫🇷',
  'Spanish': '🇪🇸',
  'mangamint': '🇮🇩',
  'mangadex': '🌍',
  'id': '🇮🇩',
  'en': '🇺🇸',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'zh': '🇨🇳'
};

/**
 * Returns the flag emoji based on source or language string.
 */
export function getFlag(source: MangaSource, language?: string): string {
  // Prioritize specific language string if provided
  if (language) {
    const lang = language.toLowerCase();
    if (FLAG_MAP[lang]) return FLAG_MAP[lang];
    // Check for common full names
    if (lang.includes('indo')) return FLAG_MAP['Indonesian'];
    if (lang.includes('eng')) return FLAG_MAP['English'];
  }
  
  return FLAG_MAP[source] || '🌍';
}
