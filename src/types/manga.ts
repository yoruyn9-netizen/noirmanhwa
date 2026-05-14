
export type MangaSource = 'asura' | 'flame' | 'komiku';

export interface Manga {
  id: string;
  title: string;
  cover: string;
  status: string;
  genres: string[];
  source: MangaSource;
  language: string;
  rating?: number;
  description?: string;
  author?: string;
  year?: string | number;
  type?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: string;
  title: string;
  source: MangaSource;
  publishAt?: string;
}

export interface MangaDetail extends Manga {
  chapters: Chapter[];
}

export interface MangaListResponse {
  data: Manga[];
  total: number;
  source: MangaSource;
}
