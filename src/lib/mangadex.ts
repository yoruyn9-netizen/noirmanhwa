
import { MangaDexChapter, MangaDexImageServer, MangaDexManga } from "@/src/types/manga";

const MANGADEX_API_URL = "https://api.mangadex.org";
const MANGADEX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangadex.org'
};

async function retryFetch(url: string, options: RequestInit, retries = 3, delay = 1000, timeout = 10000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Received status ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries reached");
}

export const getMangaList = async () => {
    const url = `${MANGADEX_API_URL}/manga?limit=20&includes[]=cover_art&includes[]=author&includes[]=artist&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`;
    const response = await retryFetch(url, {
        method: 'GET',
        headers: MANGADEX_HEADERS,
        next: { revalidate: 300, tags: ['manga'] }
    });
    if (!response.ok) throw new Error('Failed to fetch manga list');
    const data = await response.json();
    return data.data.map(formatMangaData);
};

export const getMangaDetails = async (id: string) => {
    const url = `${MANGADEX_API_URL}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const response = await retryFetch(url, {
        method: 'GET',
        headers: MANGADEX_HEADERS,
        next: { revalidate: 300, tags: ['manga', `manga-${id}`] }
    });
    if (!response.ok) throw new Error('Failed to fetch manga details');
    const data = await response.json();
    return formatMangaData(data.data);
};

export const getChapterFeed = async (id: string) => {
    const url = `${MANGADEX_API_URL}/manga/${id}/feed?limit=500&includes[]=scanlation_group&order[chapter]=asc&translatedLanguage[]=en&contentRating[]=safe`;
    const response = await retryFetch(url, {
        method: 'GET',
        headers: MANGADEX_HEADERS,
        next: { revalidate: 300, tags: ['chapters', `manga-${id}-chapters`] }
    });
    if (!response.ok) throw new Error('Failed to fetch chapter feed');
    const data = await response.json();
    return sortChapters(data.data);
};

export const getChapterImageUrls = async (chapterId: string) => {
    const url = `${MANGADEX_API_URL}/at-home/server/${chapterId}`;
    const response = await retryFetch(url, {
        method: 'GET',
        headers: MANGADEX_HEADERS,
        next: { revalidate: 86400, tags: ['images', `chapter-images-${chapterId}`] }
    });
    if (!response.ok) throw new Error('Failed to fetch image server details');
    const data: MangaDexImageServer = await response.json();
    return constructImageUrls(data);
}

const formatMangaData = (manga: MangaDexManga) => {
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    const author = manga.relationships.find(rel => rel.type === 'author');
    const artist = manga.relationships.find(rel => rel.type === 'artist');

    const coverUrl = coverArt && coverArt.attributes?.fileName
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`
        : 'https://via.placeholder.com/150';

    return {
        id: manga.id,
        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
        description: manga.attributes.description.en || Object.values(manga.attributes.description)[0],
        status: manga.attributes.status,
        demographic: manga.attributes.publicationDemographic,
        tags: manga.attributes.tags.map(tag => tag.attributes.name),
        originalLanguage: manga.attributes.originalLanguage,
        author: author?.attributes?.name || 'Unknown',
        artist: artist?.attributes?.name || 'Unknown',
        coverUrl: coverUrl
    };
};

const sortChapters = (chapters: MangaDexChapter[]): MangaDexChapter[] => {
  const seen = new Set();
  return chapters
    .filter(chapter => {
      const chapterNum = parseFloat(chapter.attributes.chapter || '0');
      if (seen.has(chapterNum)) {
        return false;
      }
      seen.add(chapterNum);
      return true;
    })
    .sort((a, b) => {
      const aNum = parseFloat(a.attributes.chapter || '0');
      const bNum = parseFloat(b.attributes.chapter || '0');
      if (aNum !== bNum) {
        return aNum - bNum;
      }
      const aVol = parseFloat(a.attributes.volume || '0');
      const bVol = parseFloat(b.attributes.volume || '0');
      return aVol - bVol;
    });
};

const constructImageUrls = (imageServerData: MangaDexImageServer) => {
    const { baseUrl, chapter } = imageServerData;
    const { hash, data, dataSaver } = chapter;
    
    const imageUrls = data.map(filename => `${baseUrl}/data/${hash}/${filename}`);
    const fallbackImageUrls = dataSaver.map(filename => `${baseUrl}/data-saver/${hash}/${filename}`);

    return {
        highQuality: imageUrls,
        lowQuality: fallbackImageUrls
    };
}
