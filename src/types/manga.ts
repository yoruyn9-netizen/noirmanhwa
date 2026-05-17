
export type MangaSource = 'anilist' | 'mangadex' | 'jikan' | 'unknown';

export interface Manga {
  id: string;
  title: string;
  cover: string;
  status: string;
  genres: string[];
  source: MangaSource;
  language?: string;
  rating?: number | null;
  description?: string;
  year?: string | number | null;
  type?: string;
  updatedAt?: string | null;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: string;
  title: string;
  source: MangaSource;
  publishAt?: string | null;
}

export interface MangaDetail extends Manga {
  chapters: Chapter[];
}

export interface MangaListResponse {
  data: Manga[];
  total: number;
  source: MangaSource;
}
