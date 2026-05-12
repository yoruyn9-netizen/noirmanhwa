
import React from 'react';
import { mangaApi } from '@/lib/api';
import ChapterImage from '@/components/ChapterImage';
import Link from 'next/link';
import { ArrowLeft, Settings, Info, AlertTriangle } from 'lucide-react';

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  console.log(`[Page] Loading Reader for: ${chapterId}`);

  try {
    const data = await mangaApi.getAtHomeServer(chapterId);
    
    if (data.error || !data.baseUrl || !data.chapter) {
      throw new Error(data.message || "Failed to establish node connection");
    }

    const { baseUrl, chapter } = data;
    // Fallback to data if dataSaver is missing, or vice versa
    const pages = chapter.dataSaver?.length > 0 ? chapter.dataSaver : chapter.data;

    if (!pages || pages.length === 0) {
      throw new Error("No data frames detected in this transmission");
    }

    return (
      <div className="min-h-screen bg-black -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
        <header className="fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
          <Link href="/" className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-glow text-accent">Active Signal</h1>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest truncate max-w-[120px]">Node ID: {chapterId.substring(0, 8)}</p>
          </div>
          <button className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
        </header>

        <main className="pt-16 pb-20 flex flex-col items-center">
          {pages.map((page: string, index: number) => (
            <ChapterImage
              key={index}
              baseUrl={baseUrl}
              chapterHash={chapter.hash}
              fileName={page}
              pageNum={index + 1}
            />
          ))}
        </main>

        <footer className="fixed bottom-0 inset-x-0 h-14 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
            <Info className="w-3.5 h-3.5" /> {pages.length} Frames Synchronized
          </div>
        </footer>
      </div>
    );
  } catch (err: any) {
    console.error('[Reader Error] Node failure:', err);
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-8 space-y-8 text-center">
        <div className="w-16 h-16 bg-accent/5 rounded-[2rem] border border-accent/20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Signal Interrupted</h1>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-xs leading-relaxed opacity-60">
            {err.message || "The transmission was lost. MangaDex node reported an incomplete data stream."}
          </p>
        </div>
        <Link 
          href="/" 
          className="px-10 py-4 bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl"
        >
          Return to Base
        </Link>
      </div>
    );
  }
}
