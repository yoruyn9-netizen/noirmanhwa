
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCover from '@/components/MangaCover';
import Link from 'next/link';
import { Flame, Play, Clock } from 'lucide-react';
import { getMangaTitle } from '@/lib/utils';

export default async function Home() {
  console.log('[Page] Loading Homepage');
  
  let trending: any[] = [];
  let latest: any[] = [];
  let error: string | null = null;

  try {
    // Use allSettled to prevent the whole page from failing if one node is slow
    const results = await Promise.allSettled([
      mangaApi.getTrending(),
      mangaApi.getLatest()
    ]);

    if (results[0].status === 'fulfilled') {
      trending = results[0].value.data || [];
    }
    
    if (results[1].status === 'fulfilled') {
      latest = results[1].value.data || [];
    }

    if (trending.length === 0 && latest.length === 0) {
      error = "Connection lost. Tap to retry.";
    }
  } catch (err) {
    console.error('[Page Error] Home Fetch Failure:', err);
    error = "Connection lost. Tap to retry.";
  }

  const heroManga = trending[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 max-w-2xl mx-auto px-4">
      {/* Hero Section */}
      {heroManga && (
        <section className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden group border border-white/5 bg-neutral-900 shadow-2xl">
          <MangaCover 
            mangaId={heroManga.id} 
            relationships={heroManga.relationships} 
            title={getMangaTitle(heroManga)}
            className="brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/20 rounded-full">
              <Flame className="w-3 h-3 text-accent fill-accent" />
              <span className="text-[8px] font-black uppercase tracking-widest text-accent">Hot Transmission</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
              {getMangaTitle(heroManga)}
            </h1>
            <p className="text-[9px] text-neutral-400 font-medium line-clamp-2 leading-relaxed max-w-xs">
              {heroManga.attributes.description.en || "Synchronizing data summary..."}
            </p>
            <Link 
              href={`/series/${heroManga.id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl w-fit"
            >
              <Play className="w-3 h-3 fill-current" /> Initialize Link
            </Link>
          </div>
        </section>
      )}

      {/* Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h2 className="text-[11px] font-black uppercase tracking-tighter text-white">Latest Uploads</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Real-time Data Stream</p>
          </div>
        </div>

        {error ? (
          <div className="py-20 text-center space-y-4 bg-neutral-900/50 rounded-[2rem] border border-dashed border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{error}</p>
            <Link href="/" className="inline-block px-6 py-2 bg-accent text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Resync Node</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {latest.map((manga) => (
              <Link key={manga.id} href={`/series/${manga.id}`} className="group space-y-3">
                <div className="aspect-[2/3] relative rounded-2xl overflow-hidden border border-white/5 bg-neutral-900 shadow-lg">
                  <MangaCover 
                    mangaId={manga.id} 
                    relationships={manga.relationships} 
                    title={getMangaTitle(manga)} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-[8px] font-black uppercase text-accent tracking-widest">View Node</span>
                  </div>
                </div>
                <div className="px-1 space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-accent transition-colors">
                    {getMangaTitle(manga)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {manga.attributes.year || '2024'}
                    </span>
                    <span className="text-[8px] font-black text-accent uppercase tracking-widest opacity-60">
                      {manga.attributes.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
