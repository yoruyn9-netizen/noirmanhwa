import React from 'react';
import { mangaApi } from '@/lib/api';
import { getCoverUrl, getMangaTitle, formatTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, Star, Info, List, ArrowLeft, BookmarkPlus, Play, Share2, ChevronRight, AlertCircle } from 'lucide-react';

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;
  
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
      <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to network
          </Link>
          <button className="p-2.5 glass rounded-xl"><Share2 className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#0f0f13]">
              <Image src={coverUrl} alt={title} fill className="object-cover" priority />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                <BookmarkPlus className="w-3.5 h-3.5" /> Save
              </button>
              <Link href={chapters.length > 0 ? `/reader/${chapters[chapters.length-1].id}` : '#'} className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                <Play className="w-3.5 h-3.5" /> Read
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {manga.attributes.tags.slice(0, 5).map(tag => (
                  <span key={tag.id} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/5 rounded text-accent">
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight uppercase text-glow">{title}</h1>
                <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.9</span>
                  <span className="flex items-center gap-1.5 text-accent"><BookOpen className="w-3 h-3" /> {manga.attributes.status}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {manga.attributes.year || '2024'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 bg-[#0f0f13] rounded-2xl border border-white/5">
              <h3 className="text-xs font-black tracking-widest flex items-center gap-2 uppercase">
                <Info className="w-4 h-4 text-accent" /> Synaptic Data
              </h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-[13px] opacity-80">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available."}
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-6 pt-10 border-t border-white/5">
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-tighter flex items-center gap-2 uppercase">
              <List className="w-5 h-5 text-accent" /> Transmissions
            </h2>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{chapters.length} Pulses loaded</p>
          </div>

          <div className="grid gap-2">
            {chapters.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border-dashed">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No transmissions detected</p>
              </div>
            ) : (
              chapters.map((chapter) => (
                <Link 
                  key={chapter.id} 
                  href={`/reader/${chapter.id}`}
                  className="flex items-center justify-between p-4 bg-[#0f0f13] rounded-xl border border-white/5 hover:bg-accent/5 hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-black text-xs group-hover:bg-accent group-hover:text-white transition-all">
                      {chapter.attributes.chapter || '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-[11px] tracking-tight uppercase">Pulse {chapter.attributes.chapter}</h4>
                      <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">{formatTimeAgo(chapter.attributes.publishAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase tracking-widest text-accent/80">{chapter.attributes.translatedLanguage}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
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
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
        <AlertCircle className="w-10 h-10 text-accent opacity-20" />
        <h1 className="text-xl font-black uppercase tracking-tighter">Node Failure</h1>
        <Link href="/" className="px-8 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Retry link</Link>
      </div>
    );
  }
}
