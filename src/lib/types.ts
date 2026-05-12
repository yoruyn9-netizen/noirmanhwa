export interface Manga {
  id: string;
  type: string;
  attributes: {
    title: { [key: string]: string };
    description: { [key: string]: string };
    status: string;
    year: number;
    contentRating: string;
    tags: Array<{
      id: string;
      attributes: {
        name: { en: string };
      };
    }>;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: {
      fileName?: string;
    };
  }>;
}

export interface Chapter {
  id: string;
  attributes: {
    volume: string | null;
    chapter: string;
    title: string | null;
    translatedLanguage: string;
    publishAt: string;
    pages: number;
  };
}

export interface AtHomeResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface SearchParams {
  title?: string;
  limit?: number;
  offset?: number;
  includedTags?: string[];
  excludedTags?: string[];
  status?: string[];
  contentRating?: string[];
  order?: { [key: string]: string };
}

export interface MangaDexResponse<T> {
  result: string;
  response: string;
  data: T;
  limit: number;
  offset: number;
  total: number;
}