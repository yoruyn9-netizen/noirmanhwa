import React from 'react';
import { mangaApi } from '@/lib/api';
import { getCoverUrl, getMangaTitle, formatTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, Star, Info, List, ArrowLeft, BookmarkPlus } from 'lucide-react';

interface SeriesPageProps {
  params: { id: string };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = params;
  
  try {
    const [mangaRes, chaptersRes] = await Promise.all([
      mangaApi.getMangaDetails(id),
      mangaApi.getChapters(id)
    ]);

    const manga = mangaRes.data;
    const chapters = chaptersRes.data;
    const title = getMangaTitle(manga);
    const coverUrl = getCoverUrl(manga, 'original');

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <Image 
                src={coverUrl} 
                alt={title} 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-secondary/30 rounded-xl border border-white/10 font-bold hover:bg-secondary/50 transition-all">
              <BookmarkPlus className="w-5 h-5 text-accent" /> Bookmark Series
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {manga.attributes.tags.slice(0, 5).map(tag => (
                  <span key={tag.id} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded">
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{title}</h1>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> 4.9</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-accent" /> {manga.attributes.status}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {manga.attributes.year || '2024'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2"><Info className="w-5 h-5 text-accent" /> Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0]}
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-6 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <List className="w-6 h-6 text-accent" /> CHAPTER LIST
            </h2>
            <span className="text-sm font-bold text-muted-foreground">{chapters.length} Chapters Available</span>
          </div>

          <div className="grid gap-2">
            {chapters.length === 0 ? (
              <div className="text-center py-20 bg-secondary/10 rounded-2xl">
                <p className="text-muted-foreground">No chapters available in selected languages.</p>
              </div>
            ) : (
              chapters.map((chapter) => (
                <Link 
                  key={chapter.id} 
                  href={`/reader/${chapter.id}`}
                  className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-white/5 hover:bg-secondary/40 hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-sm group-hover:bg-accent group-hover:text-white transition-colors">
                      {chapter.attributes.chapter}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Chapter {chapter.attributes.chapter} {chapter.attributes.title ? `: ${chapter.attributes.title}` : ''}</h4>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{formatTimeAgo(chapter.attributes.publishAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black uppercase">{chapter.attributes.translatedLanguage}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Manga Detail Unavailable</h1>
        <p className="text-muted-foreground mb-8">We couldn't retrieve the details for this series. Please try again later.</p>
        <Link href="/" className="px-6 py-3 bg-primary rounded-xl font-bold">Back to Home</Link>
      </div>
    );
  }
}