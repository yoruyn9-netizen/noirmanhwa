
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
 * Returns localized signal origin flag
 */
export function getFlag(source: MangaSource, language?: string): string {
  if (language) {
    const lang = language.toLowerCase();
    if (FLAG_MAP[lang]) return FLAG_MAP[lang];
    if (lang.includes('indo')) return FLAG_MAP['Indonesian'];
    if (lang.includes('eng')) return FLAG_MAP['English'];
  }
  return FLAG_MAP[source] || '🌍';
}
