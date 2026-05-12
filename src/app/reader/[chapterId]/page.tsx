import React from 'react';
import { mangaApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, ImageOff } from 'lucide-react';
import Image from 'next/image';

interface ReaderPageProps {
  params: { chapterId: string };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = params;

  try {
    const atHome = await mangaApi.getAtHomeServer(chapterId);
    const baseUrl = atHome.baseUrl;
    const hash = atHome.chapter.hash;
    const pages = atHome.chapter.data;

    return (
      <div className="min-h-screen bg-black -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
        <header className="fixed top-0 inset-x-0 h-16 glass z-50 flex items-center justify-between px-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-tight uppercase">Reading Chapter</h1>
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Webtoon Mode</p>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        <div className="pt-16 flex flex-col items-center">
          {pages.map((page, idx) => {
            const pageUrl = `${baseUrl}/data/${hash}/${page}`;
            return (
              <div key={idx} className="relative w-full max-w-4xl bg-secondary/5 min-h-[300px] flex items-center justify-center overflow-hidden">
                {/* We use next/image with unoptimized=true for webtoon pages because ratios vary wildly */}
                <Image
                  src={pageUrl}
                  alt={`Page ${idx + 1}`}
                  width={1000}
                  height={1500}
                  className="w-full h-auto object-contain"
                  loading={idx < 3 ? "eager" : "lazy"}
                  unoptimized={true}
                  priority={idx < 2}
                />
              </div>
            );
          })}
        </div>

        <footer className="fixed bottom-0 inset-x-0 h-20 glass z-50 flex items-center justify-around px-4">
           <button className="flex items-center gap-2 px-6 py-2 bg-secondary/50 rounded-xl font-bold text-sm disabled:opacity-30" disabled>
             <ChevronLeft className="w-4 h-4" /> Previous
           </button>
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
             {pages.length} Pages Loaded
           </div>
           <button className="flex items-center gap-2 px-6 py-2 bg-primary rounded-xl font-bold text-sm">
             Next <ChevronRight className="w-4 h-4" />
           </button>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Reader Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-black">
        <ImageOff className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error Loading Images</h1>
        <p className="text-muted-foreground mb-8">The images for this chapter couldn't be loaded from the MangaDex network.</p>
        <Link href="/" className="px-6 py-3 bg-primary rounded-xl font-bold">Return to Library</Link>
      </div>
    );
  }
}
