
"use client";

import React, { useEffect, useState, use } from 'react';
import { fetchChapters } from '@/lib/mangaApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, List, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import FlagBadge from '@/components/ui/FlagBadge';
import { useMangaStore } from '@/store/mangaStore';
import BookmarkButton from '@/components/BookmarkButton';

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams.get('source') || 'asura';
  
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const { addToHistory } = useMangaStore();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChapters(id, source);
        setChapters(data);
        addToHistory(id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, source, addToHistory]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-accent animate-spin" /></div>;

  // Placeholder logic for title extraction from slug/id until detail API is fully unified
  const displayTitle = id.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-1000 px-4">
      <header className="h-16 flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-neutral-900 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <FlagBadge source={source as any} size="sm" />
      </header>

      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="relative w-full md:w-80 flex-shrink-0">
          <div className="aspect-[2/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0f]">
            <SafeImage src={`https://picsum.photos/seed/${id}/600/900`} alt={displayTitle} />
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-glow">{displayTitle}</h1>
          <div className="grid grid-cols-2 gap-4">
             <BookmarkButton manga={{ id, source, title: displayTitle, cover: `https://picsum.photos/seed/${id}/600/900` }} />
             {chapters.length > 0 && (
               <Link href={`/reader/${id}/${chapters[0]?.id}?source=${source}`} className="flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                 <Play className="w-4 h-4 fill-current" /> START READING
               </Link>
             )}
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <h2 className="text-[12px] font-black uppercase flex items-center gap-3 text-white"><List className="w-5 h-5 text-accent" /> Chapter Stack</h2>
        <div className="grid gap-3">
          {chapters.length === 0 ? (
            <div className="p-10 text-center glass rounded-3xl opacity-40">
              <p className="text-[9px] font-black uppercase tracking-widest">No chapters localized for this node</p>
            </div>
          ) : (
            chapters.map((ch) => (
              <Link key={ch.id} href={`/reader/${id}/${ch.id}?source=${source}`} className="flex items-center justify-between p-5 bg-[#0a0a0f] rounded-2xl border border-white/5 hover:border-accent/40 transition-all">
                <span className="text-[11px] font-black uppercase text-white">Chapter {ch.number}</span>
                <Play className="w-3 h-3 text-accent fill-current" />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
