
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCover from '@/components/MangaCover';
import GenreSlider from '@/components/GenreSlider';
import Link from 'next/link';
import { Play, Clock, Activity } from 'lucide-react';
import { getMangaTitle, cleanDescription } from '@/lib/utils';

export default async function Home() {
  console.log('[Page] Loading Homepage');
  
  let trending: any[] = [];
  let latest: any[] = [];
  let genres: any[] = [];
  let error: string | null = null;

  try {
    const results = await Promise.allSettled([
      mangaApi.getTrending(),
      mangaApi.getLatest(),
      mangaApi.getTags()
    ]);

    if (results[0].status === 'fulfilled') trending = results[0].value.data || [];
    if (results[1].status === 'fulfilled') latest = results[1].value.data || [];
    if (results[2].status === 'fulfilled') genres = results[2].value.data || [];

    if (trending.length === 0 && latest.length === 0) {
      error = "Connection lost. Tap to retry.";
    }
  } catch (err) {
    console.error('[Page Error] Home Fetch Failure:', err);
    error = "Connection lost. Tap to retry.";
  }

  const heroManga = trending[0];

  return (
    <div className="space-y-12 pb-20 max-w-2xl mx-auto px-4 relative">
      {/* Top Right Status Animation */}
      <div className="absolute top-0 right-4 flex items-center gap-2 pointer-events-none z-10">
        <div className="flex flex-col items-end">
          <span className="text-[7px] font-black text-accent uppercase tracking-[0.4em] animate-pulse">System Active</span>
          <span className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest opacity-60">Frequency 2.4GHz</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
      </div>

      {/* Hero Section */}
      {heroManga && (
        <section className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden group border border-white/5 bg-neutral-900 shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
          <MangaCover 
            mangaId={heroManga.id} 
            relationships={heroManga.relationships} 
            title={getMangaTitle(heroManga)}
            className="brightness-[0.4] transition-transform duration-[3000ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/20 rounded-full w-fit backdrop-blur-md">
              <Activity className="w-3 h-3 text-accent animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-widest text-accent">Hot Transmission</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
              {getMangaTitle(heroManga)}
            </h1>
            <p className="text-[9px] text-neutral-400 font-medium line-clamp-2 leading-relaxed max-w-xs opacity-80">
              {cleanDescription(heroManga.attributes.description.en || heroManga.attributes.description.ja || "Synchronizing data summary...")}
            </p>
            <Link 
              href={`/series/${heroManga.id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-black rounded-2xl text-[8px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all duration-500 shadow-xl w-fit active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" /> Read Now
            </Link>
          </div>
        </section>
      )}

      {/* Genre Slider */}
      <section className="animate-in fade-in slide-in-from-left duration-700 delay-300">
        <GenreSlider genres={genres} />
      </section>

      {/* Grid Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <div className="space-y-1">
            <h2 className="text-[11px] font-black uppercase tracking-tighter text-white">Latest Uploads</h2>
            <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Real-time Data Stream</p>
          </div>
          <div className="w-12 h-px bg-white/5" />
        </div>

        {error ? (
          <div className="py-20 text-center space-y-4 bg-neutral-900/50 rounded-[2rem] border border-dashed border-white/5 animate-in fade-in">
            <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">{error}</p>
            <Link href="/" className="inline-block px-8 py-3 bg-accent text-white rounded-xl text-[7px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">Resync Node</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10">
            {latest.map((manga, idx) => (
              <Link 
                key={manga.id} 
                href={`/series/${manga.id}`} 
                className="group space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="aspect-[2/3] relative rounded-[2rem] overflow-hidden border border-white/5 bg-neutral-900 shadow-lg group-hover:shadow-accent/10 transition-all duration-700">
                  <MangaCover 
                    mangaId={manga.id} 
                    relationships={manga.relationships} 
                    title={getMangaTitle(manga)} 
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                    <span className="text-[7px] font-black uppercase text-accent tracking-widest drop-shadow-md">Read Now</span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                    <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                       <Play className="w-2.5 h-2.5 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="px-1 space-y-1.5">
                  <h3 className="text-[9px] font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-accent transition-colors duration-300">
                    {getMangaTitle(manga)}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-2 h-2" /> {manga.attributes.year || '2024'}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                    <span className="text-[7px] font-black text-accent uppercase tracking-widest opacity-60">
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
