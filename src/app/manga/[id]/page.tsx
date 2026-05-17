"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { MangaDetail, MangaSource } from '@/types/manga';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Calendar, Clock, List, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import FlagBadge from '@/components/ui/FlagBadge';
import RecommendationRow from '@/components/manga/RecommendationRow';
import { formatTimeAgo } from '@/lib/utils';
import { useMangaStore } from '@/store/mangaStore';

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const source: MangaSource = 'mangadex';
  
  const [data, setData] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToHistory } = useMangaStore();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const detail = await mangaApi.fetchMangaDetail(id, source);
        if (detail) {
          setData(detail);
          addToHistory(id);
        }
      } catch (err) {
        console.error('[Detail Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, source, addToHistory]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <div className="absolute inset-0 blur-2xl bg-accent/20 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Loading Details</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-8">
        <AlertTriangle className="w-16 h-16 text-red-500 opacity-20" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Manga Not Found</h2>
        <button onClick={() => router.back()} className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-[9px] uppercase tracking-widest">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-1000 px-4">
      <header className="h-16 flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-neutral-900 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-accent">ID: {id.substring(0, 8)}</span>
          <FlagBadge source={source} size="sm" />
        </div>
        <div className="w-11" />
      </header>

      <div className="space-y-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="relative w-full md:w-80 flex-shrink-0 group">
            <div className="aspect-[2/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0f]">
              <SafeImage src={data.cover} alt={data.title} className="group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
            <FlagBadge source={source} className="absolute -top-4 -right-4 w-12 h-12 text-xl" />
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.genres.slice(0, 4).map((g, i) => (
                  <span key={i} className="px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-lg text-accent text-[8px] font-black uppercase tracking-widest">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-glow">{data.title}</h1>
              <div className="flex items-center gap-6 text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                <span className="flex items-center gap-2 text-accent"><Calendar className="w-3.5 h-3.5" /> {data.year || '2024'}</span>
                <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {data.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.chapters.length > 0 && (
                <Link 
                  href={`/reader/${id}/${data.chapters[0].id}`}
                  className="flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> START READING
                </Link>
              )}
              <button className="flex items-center justify-center gap-3 py-5 bg-accent/10 border border-accent/20 text-accent rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                ADD TO LIBRARY
              </button>
            </div>

            <div className="space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Synopsis
              </h3>
              <p className="text-[12px] text-neutral-400 leading-relaxed font-medium opacity-80">
                {data.description || 'No description available for this signal.'}
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-8 pt-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[12px] font-black uppercase tracking-tighter flex items-center gap-3 text-white">
              <List className="w-5 h-5 text-accent" /> Chapter List
            </h2>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{data.chapters.length} Units</span>
          </div>

          <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
            {data.chapters.map((chapter) => (
              <Link 
                key={chapter.id} 
                href={`/reader/${id}/${chapter.id}`}
                className="flex items-center justify-between p-5 bg-[#0a0a0f] rounded-2xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-accent flex items-center justify-center font-black text-[10px] group-hover:bg-accent group-hover:text-white transition-all">
                    {chapter.number}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-[11px] uppercase tracking-tight text-white group-hover:text-accent transition-colors">
                      {chapter.title}
                    </h4>
                    <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">
                      {chapter.publishAt ? formatTimeAgo(chapter.publishAt) : 'Recently Added'}
                    </p>
                  </div>
                </div>
                <Play className="w-3 h-3 text-neutral-800 group-hover:text-accent fill-current transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recommendations Section - Strict Horizontal Scroll */}
        <RecommendationRow currentId={id} genres={data.genres} />
      </div>
    </div>
  );
}