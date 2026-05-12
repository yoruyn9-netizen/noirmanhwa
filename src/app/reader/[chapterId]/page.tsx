import React from 'react';
import { mangaApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Settings, ImageOff } from 'lucide-react';
import Image from 'next/image';

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;

  try {
    const atHome = await mangaApi.getAtHomeServer(chapterId);
    
    if (!atHome || !atHome.chapter || !atHome.chapter.data) {
      throw new Error("Invalid response from MangaDex @Home server");
    }

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

        <div className="pt-16 pb-24 flex flex-col items-center">
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
              <ImageOff className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">This chapter has no pages available.</p>
            </div>
          ) : (
            pages.map((page, idx) => {
              // Construct URL: {baseUrl}/data/{hash}/{page}
              const pageUrl = `${baseUrl}/data/${hash}/${page}`;
              return (
                <div key={idx} className="relative w-full max-w-4xl bg-secondary/5 min-h-[300px] flex items-center justify-center overflow-hidden">
                  <Image
                    src={pageUrl}
                    alt={`Page ${idx + 1}`}
                    width={1000}
                    height={1500}
                    className="w-full h-auto object-contain"
                    unoptimized={true}
                    loading={idx < 2 ? "eager" : "lazy"}
                    priority={idx < 2}
                  />
                </div>
              );
            })
          )}
        </div>

        <footer className="fixed bottom-0 inset-x-0 h-16 glass z-50 flex items-center justify-center px-4">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
             {pages.length} Pages Loaded
           </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Reader Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-black">
        <ImageOff className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error Loading Images</h1>
        <p className="text-muted-foreground mb-8">
          The images for this chapter couldn't be loaded. 
          The MangaDex node might be offline or busy.
        </p>
        <Link href="/" className="px-6 py-3 bg-primary rounded-xl font-bold">Return to Library</Link>
      </div>
    );
  }
}
