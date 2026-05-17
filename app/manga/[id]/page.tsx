"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, List, Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';

type MangaDetail = {
  id: string;
  title: string;
  cover: string;
  authors: string[];
  artists: string[];
  status: string;
  genres: string[];
  description: string;
};

type ChapterItem = {
  id: string;
  number: string;
  title: string;
  publishedAt?: string | null;
};

function normalizeMangaId(value: string) {
  const match = value.match(/^(?:mangadex-)?(.+)$/i);
  return match ? match[1] : value;
}

export default function MangaDetailPage({ params }: { params: { id: string } }) {
  const mangaId = normalizeMangaId(params.id);
  const router = useRouter();

  const [detail, setDetail] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadManga = async () => {
      setLoading(true);
      setError(null);

      try {
        const [detailResponse, chapterResponse] = await Promise.all([
          fetch(`https://api.mangadex.org/manga/${encodeURIComponent(mangaId)}?includes[]=cover_art&includes[]=author&includes[]=artist`),
          fetch(`https://api.mangadex.org/manga/${encodeURIComponent(mangaId)}/feed?limit=100&order[chapter]=desc&translatedLanguage[]=en`)
        ]);

        if (!detailResponse.ok) {
          throw new Error(`MangaDex detail request failed with status ${detailResponse.status}`);
        }

        if (!chapterResponse.ok) {
          throw new Error(`MangaDex chapter request failed with status ${chapterResponse.status}`);
        }

        const detailJson = await detailResponse.json();
        const chapterJson = await chapterResponse.json();
        const detailData = detailJson.data;

        if (!detailData) {
          throw new Error('MangaDex returned empty manga data.');
        }

        const title =
          detailData.attributes?.title?.en ||
          detailData.attributes?.title?.en_jp ||
          Object.values(detailData.attributes?.title || {})?.[0] ||
          'Unknown Title';

        const relationshipItems = Array.isArray(detailData.relationships) ? detailData.relationships : [];
        const authors = relationshipItems
          .filter((relationship: any) => relationship.type === 'author')
          .map((author: any) => author.attributes?.name)
          .filter(Boolean);
        const artists = relationshipItems
          .filter((relationship: any) => relationship.type === 'artist')
          .map((artist: any) => artist.attributes?.name)
          .filter(Boolean);

        const coverRelationship = relationshipItems.find((relationship: any) => relationship.type === 'cover_art');
        const coverFileName = coverRelationship?.attributes?.fileName;
        const cover = coverFileName
          ? `https://uploads.mangadex.org/covers/${detailData.id}/${coverFileName}`
          : '';

        const genres = Array.isArray(detailData.attributes?.tags)
          ? detailData.attributes.tags
              .filter((tag: any) => tag.attributes?.category === 'genre')
              .map((tag: any) => tag.attributes?.name?.en || tag.attributes?.name)
              .filter(Boolean)
          : [];

        const description =
          detailData.attributes?.description?.en ||
          Object.values(detailData.attributes?.description || {})?.[0] ||
          'No description available.';

        setDetail({
          id: detailData.id,
          title,
          cover,
          authors,
          artists,
          status: detailData.attributes?.status || 'unknown',
          genres,
          description
        });

        const chapterData = Array.isArray(chapterJson.data) ? chapterJson.data : [];
        setChapters(
          chapterData.map((chapter: any) => ({
            id: chapter.id,
            number: chapter.attributes?.chapter || '0',
            title: chapter.attributes?.title || `Chapter ${chapter.attributes?.chapter || 'Unknown'}`,
            publishedAt: chapter.attributes?.publishAt || null
          }))
        );
      } catch (err: any) {
        console.error('[MangaDetail]', err);
        setError(err?.message || 'Failed to load MangaDex data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadManga();
  }, [mangaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">Loading manga details</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm text-neutral-300">{error || 'Manga details could not be loaded.'}</p>
        <button
          onClick={() => router.back()}
          className="mt-8 px-6 py-3 bg-white text-black rounded-2xl uppercase text-[10px] font-black tracking-[0.3em]"
        >
          Go back
        </button>
      </div>
    );
  }

  const latestChapter = chapters[0];

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4 pt-8">
      <header className="flex items-center justify-between mb-10 gap-4">
        <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-300" />
        </button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">MangaDex</p>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400">ID {mangaId}</p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b10] shadow-2xl">
            <SafeImage src={detail.cover} alt={detail.title} className="aspect-[2/3] w-full object-cover" />
          </div>

          <div className="space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs text-neutral-400 uppercase tracking-[0.4em]">Status</p>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{detail.status}</p>
          </div>

          <div className="space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs text-neutral-400 uppercase tracking-[0.4em]">Author</p>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{detail.authors.length ? detail.authors.join(', ') : 'Unknown Author'}</p>
          </div>

          {detail.artists.length > 0 && (
            <div className="space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-[0.4em]">Artist</p>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{detail.artists.join(', ')}</p>
            </div>
          )}

          <div className="space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs text-neutral-400 uppercase tracking-[0.4em]">Genres</p>
            <div className="flex flex-wrap gap-2">
              {detail.genres.length > 0 ? (
                detail.genres.map((genre) => (
                  <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-neutral-200">
                    {genre}
                  </span>
                ))
              ) : (
                <span className="text-sm text-neutral-500">No genres available</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white">{detail.title}</h1>
            <p className="text-sm text-neutral-400 leading-relaxed">{detail.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {latestChapter ? (
              <a
                href={`https://mangadex.org/chapter/${latestChapter.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-black transition hover:bg-neutral-100"
              >
                <Play className="w-4 h-4" />
                Read Latest Chapter
              </a>
            ) : (
              <div className="rounded-2xl bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-neutral-400">
                No chapters available yet
              </div>
            )}
          </div>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <List className="w-4 h-4 text-accent" /> Chapter List
              </h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{chapters.length} items</span>
            </div>

            <div className="space-y-3">
              {chapters.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-neutral-400">
                  No chapters found for this manga.
                </div>
              ) : (
                chapters.map((chapter) => (
                  <div key={chapter.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f1118] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Chapter {chapter.number}</p>
                      <p className="text-sm font-black text-white">{chapter.title}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                        {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No release date'}
                      </span>
                      <a
                        href={`https://mangadex.org/chapter/${chapter.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:bg-accent/90"
                      >
                        Read
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
