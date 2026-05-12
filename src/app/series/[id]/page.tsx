
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCover from '@/components/MangaCover';
import { getMangaTitle, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Play, BookmarkPlus, Info, List, ChevronRight } from 'lucide-react';

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;
  console.log(`[Page] Loading Series: ${id}`);

  try {
    const [mangaRes, chaptersRes] = await Promise.all([
      mangaApi.getMangaDetails(id),
      mangaApi.getChapters(id)
    ]);

    const manga = mangaRes.data;
    const chapters = chaptersRes.data || [];
    const title = getMangaTitle(manga);

    return (
      <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
        <header className="flex items-center justify-between">
          <Link href="/" className="p-3 bg-neutral-900 border border-white/5 rounded-2xl hover:bg-neutral-800 transition-all group">
            <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Series Node</h1>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Protocol ID: {id.substring(0, 8)}</p>
          </div>
          <div className="w-11" /> {/* Spacer */}
        </header>

        <div className="space-y-8">
          <div className="relative aspect-[2/3] w-64 mx-auto rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-neutral-900">
            <MangaCover mangaId={id} relationships={manga.relationships} title={title} />
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {manga.attributes.tags.slice(0, 4).map((tag: any) => (
                <span key={tag.id} className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 bg-accent/5 border border-accent/10 rounded-md text-accent">
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight text-white">{title}</h1>
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">{manga.attributes.status} | {manga.attributes.year || '2024'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button className="flex items-center justify-center gap-3 py-4 bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
               <BookmarkPlus className="w-4 h-4" /> Save Node
             </button>
             <Link href={chapters.length > 0 ? `/reader/${chapters[0].id}` : '#'} className="flex items-center justify-center gap-3 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
               <Play className="w-4 h-4 fill-current" /> Start Signal
             </Link>
          </div>

          <div className="p-6 bg-neutral-900 border border-white/5 rounded-[2rem] space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-accent">
              <Info className="w-4 h-4" /> Log Summary
            </h3>
            <p className="text-[12px] text-neutral-400 leading-relaxed font-medium opacity-80">
              {manga.attributes.description.en || "No data available in this sector."}
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-white">
              <List className="w-4 h-4 text-accent" /> Chapters
            </h2>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{chapters.length} Units Found</span>
          </div>

          <div className="grid gap-2">
            {chapters.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900 rounded-[2rem] border border-dashed border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600">No Transmission Found</p>
              </div>
            ) : (
              chapters.map((chapter: any) => (
                <Link 
                  key={chapter.id} 
                  href={`/reader/${chapter.id}`}
                  className="flex items-center justify-between p-4 bg-neutral-900 rounded-2xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-accent font-black text-[10px] group-hover:bg-accent group-hover:text-white transition-all">
                      {chapter.attributes.chapter}
                    </div>
                    <div>
                      <h4 className="font-black text-[11px] uppercase tracking-tight text-white">Chapter {chapter.attributes.chapter}</h4>
                      <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{formatTimeAgo(chapter.attributes.publishAt)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-accent transition-colors" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    );
  } catch (err) {
    console.error('[Page Error] Series Detail Failure:', err);
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-6">
        <h1 className="text-xl font-black uppercase tracking-tighter text-white">Node unreachable</h1>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">The MangaDex network is experiencing high latency.</p>
        <Link href="/" className="inline-block px-8 py-3 bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Return to Home</Link>
      </div>
    );
  }
}
