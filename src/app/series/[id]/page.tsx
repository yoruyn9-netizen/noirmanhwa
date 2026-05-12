import React from 'react';
import { mangaApi } from '@/lib/api';
import { getCoverUrl, getMangaTitle, formatTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, Star, Info, List, ArrowLeft, BookmarkPlus, Play, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> RECALL NODE
          </Link>
          <button className="p-3 glass rounded-2xl"><Share2 className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
            <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,1)] bg-[#0f0f13] group">
              <Image src={coverUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">
                <BookmarkPlus className="w-4 h-4" /> SAVE NODE
              </button>
              <Link href={chapters.length > 0 ? `/reader/${chapters[chapters.length-1].id}` : '#'} className="flex items-center justify-center gap-3 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-accent hover:text-white transition-all">
                <Play className="w-4 h-4" /> READ 01
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {manga.attributes.tags.slice(0, 6).map(tag => (
                  <span key={tag.id} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-accent">
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-glow">{title}</h1>
                <div className="flex items-center gap-6 text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.9</span>
                  <span className="flex items-center gap-2 text-accent"><BookOpen className="w-4 h-4" /> {manga.attributes.status}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {manga.attributes.year || '2024'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-8 bg-[#0f0f13] rounded-[2rem] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase">
                <Info className="w-5 h-5 text-accent" /> SYNAPTIC DATA
              </h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-base">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available in current node."}
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-8 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <List className="w-8 h-8 text-accent" /> TRANSMISSION LOGS
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{chapters.length} PULSES LOADED</p>
            </div>
          </div>

          <div className="grid gap-3">
            {chapters.length === 0 ? (
              <div className="text-center py-24 glass rounded-[2rem] border-dashed border-white/10">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">No transmissions detected in localized frequency.</p>
              </div>
            ) : (
              chapters.map((chapter) => (
                <Link 
                  key={chapter.id} 
                  href={`/reader/${chapter.id}`}
                  className="flex items-center justify-between p-6 bg-[#0f0f13] rounded-2xl border border-white/5 hover:bg-accent/5 hover:border-accent/30 transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-lg group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                      {chapter.attributes.chapter || '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-base tracking-tight">PULSE {chapter.attributes.chapter} {chapter.attributes.title ? `: ${chapter.attributes.title}` : ''}</h4>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">{formatTimeAgo(chapter.attributes.publishAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent/80 border border-white/5">{chapter.attributes.translatedLanguage}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
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
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6">
        <div className="p-8 bg-accent/10 rounded-full"><AlertCircle className="w-16 h-16 text-accent" /></div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">NODE FAILURE</h1>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">Neural link to MangaDex severed. Retrying connection protocol...</p>
        </div>
        <Link href="/" className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl">RE-ESTABLISH LINK</Link>
      </div>
    );
  }
}

import { List, ChevronRight, AlertCircle } from 'lucide-react';