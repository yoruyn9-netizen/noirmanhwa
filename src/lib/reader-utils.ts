
/**
 * Utility functions for the Manga Reader interface.
 */

export interface ReaderPrefs {
  direction: 'vertical' | 'ltr' | 'rtl';
  fitMode: 'fit' | 'original' | 'stretch';
  autoScroll: boolean;
  autoScrollSpeed: number;
  theme: 'dark' | 'sepia' | 'light';
}

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  direction: 'vertical',
  fitMode: 'fit',
  autoScroll: false,
  autoScrollSpeed: 1,
  theme: 'dark',
};

/**
 * Persists reader settings to localStorage.
 */
export const saveReaderPrefs = (prefs: ReaderPrefs) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('noir_reader_prefs', JSON.stringify(prefs));
};

/**
 * Retrieves reader settings from localStorage.
 */
export const loadReaderPrefs = (): ReaderPrefs => {
  if (typeof window === 'undefined') return DEFAULT_READER_PREFS;
  const saved = localStorage.getItem('noir_reader_prefs');
  if (!saved) return DEFAULT_READER_PREFS;
  try {
    return { ...DEFAULT_READER_PREFS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_READER_PREFS;
  }
};

/**
 * Smoothly scrolls to a position.
 */
export const smoothScroll = (top: number) => {
  window.scrollTo({
    top,
    behavior: 'smooth',
  });
};
