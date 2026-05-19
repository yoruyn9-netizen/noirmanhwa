import {
    MangaDexManga,
    MangaDexChapter,
    getDisplayTitle,
    constructCoverUrl
} from './mangadex';
import { Manga, Chapter } from '@/src/types/manga'; // Adjusted path based on typical project structure

/**
 * Maps a MangaDexManga object to the application's internal Manga type.
 * This ensures a consistent data structure for the UI, regardless of the data source.
 */
export function adaptManga(mdManga: MangaDexManga): Manga {
    const description = mdManga.attributes.description?.en 
        || Object.values(mdManga.attributes.description || {})[0]
        || 'No description available.';

    const author = mdManga.relationships.find(r => r.type === 'author');

    return {
        id: mdManga.id,
        title: getDisplayTitle(mdManga),
        cover: constructCoverUrl(mdManga, '.512.jpg'),
        status: mdManga.attributes.status,
        genres: mdManga.attributes.tags.map(tag => tag.attributes.name.en).filter(Boolean),
        source: 'mangadex',
        language: mdManga.attributes.originalLanguage,
        rating: null, // MangaDex API list doesn't provide a direct rating. This can be supplemented later.
        description: description,
        year: mdManga.attributes.year,
        type: mdManga.attributes.publicationDemographic || undefined,
        updatedAt: mdManga.attributes.updatedAt,
        // authorName is not in the type, but if it were: author?.attributes?.name || 'Unknown'
    };
}

/**
 * Maps a MangaDexChapter object to the application's internal Chapter type.
 */
export function adaptChapter(mdChapter: MangaDexChapter, mangaId: string): Chapter {
    const scanlationGroup = mdChapter.relationships.find(r => r.type === 'scanlation_group');

    return {
        id: mdChapter.id,
        mangaId: mangaId,
        number: mdChapter.attributes.chapter || '0',
        title: mdChapter.attributes.title || `Chapter ${mdManga.attributes.chapter}`.trim(),
        source: 'mangadex',
        publishAt: mdChapter.attributes.publishAt,
        // scanlationGroup is not in the type, but if it were: scanlationGroup?.attributes?.name || 'Unknown'
    };
}

/**
 * Maps an array of MangaDexManga objects to an array of Manga objects.
 */
export function adaptMangaList(mdMangaList: MangaDexManga[]): Manga[] {
    if (!mdMangaList) return [];
    return mdMangaList.map(mdManga => adaptManga(mdManga));
}

/**
 * Maps an array of MangaDexChapter objects to an array of Chapter objects.
 */
export function adaptChapterList(mdChapterList: MangaDexChapter[], mangaId: string): Chapter[] {
    if (!mdChapterList) return [];
    return mdChapterList.map(mdChapter => adaptChapter(mdChapter, mangaId));
}
