
import React from 'react';
import { mangaApi } from '@/lib/api';
import SafeImage from '@/components/SafeImage';
import { getMangaTitle, getCoverUrl, getMangaDescription } from '@/lib/utils';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';
import ChapterList from '@/components/ChapterList';
import { 
  ArrowLeft, 
  Play, 
  Info, 
  Calendar,
  Clock,
  Globe
} from 'lucide-react';

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Series Detail Node
 * Uses 'id' slug name consistently for the Manga identity.
 */
export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;

  try {
    const [mangaRes, chaptersRes] = await Promise.all([
      mangaApi.getMangaDetails(id),
      mangaApi.getChapters(id)
    ]);

    if (!mangaRes.data) throw new Error("Manga node not found.");

    const manga = mangaRes.data;
    const chapters = chaptersRes.data || [];
    const title = getMangaTitle(manga);
    const coverUrl = getCoverUrl(manga, 'original');
    const description = getMangaDescription(manga);

    const hasIndonesian = chapters.some((c: any) => c.attributes.translatedLanguage === 'id');

    return (
      <div className="max-w-2xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
        <header className="flex items-center justify-between">
          <Link href="/" className="p-3 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-neutral-900 transition-all group">
            <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-[8px] font-black uppercase tracking-[0.3em] text-accent">Protocol: {id.substring(0, 8)}</h1>
          </div>
          <div className="w-11" />
        </header>

        <div className="space-y-10">
          <div className="relative aspect-[2/3] w-64 mx-auto rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0f] group">
            <SafeImage src={coverUrl} alt={title} className="group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          </div>

          <div className="text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              {manga.attributes.tags.slice(0, 5).map((tag: any) => (
                <span key={tag.id} className="text-[7px] font-black uppercase tracking-widest px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-lg text-accent">
                  {tag.attributes.name.en}
                </span>
              ))}
              {hasIndonesian && (
                <span className="text-[7px] font-black uppercase tracking-widest px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-1.5">
                  <Globe className="w-2.5 h-2.5" /> ID
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight text-glow text-white px-4">{title}</h1>
            <div className="flex items-center justify-center gap-6 text-neutral-500 font-black text-[8px] uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-accent"><Calendar className="w-3 h-3" /> {manga.attributes.year || '2024'}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-800" />
              <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {manga.attributes.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-4">
             <BookmarkButton manga={manga} />
             <Link 
              href={chapters.length > 0 ? `/reader/${chapters[0].id}` : '#'} 
              className="flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
            >
               <Play className="w-4 h-4 fill-current" /> READ NOW
             </Link>
          </div>

          <div className="mx-4 p-8 bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] space-y-4 shadow-2xl">
            <h3 className="text-[9px] font-black uppercase tracking-widest flex items-center gap-3 text-accent">
              <Info className="w-3.5 h-3.5" /> SYNOPSIS LOG
            </h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-medium opacity-80">
              {description}
            </p>
          </div>
        </div>

        <ChapterList chapters={chapters} mangaId={id} />
      </div>
    );
  } catch (err: any) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-6">
        <h1 className="text-xl font-black uppercase tracking-tighter text-white">Signal Lost</h1>
        <Link href="/" className="inline-block px-10 py-4 bg-accent text-white rounded-2xl font-black text-[9px] uppercase tracking-widest">Return Home</Link>
      </div>
    );
  }
}
