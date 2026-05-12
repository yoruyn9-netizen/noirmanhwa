
import React from 'react';
import { mangaApi } from '@/lib/api';
import ChapterImage from '@/components/ChapterImage';
import Link from 'next/link';
import { ArrowLeft, Settings, Info } from 'lucide-react';

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  console.log(`[Page] Loading Reader for: ${chapterId}`);

  try {
    const data = await mangaApi.getAtHomeServer(chapterId);
    
    if (!data.baseUrl || !data.chapter?.hash || !data.chapter.data?.length) {
      throw new Error("Incomplete chapter data");
    }

    const { baseUrl, chapter } = data;

    return (
      <div className="min-h-screen bg-black -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
        <header className="fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
          <Link href="/" className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">Active Signal</h1>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest truncate max-w-[120px]">Node ID: {chapterId.substring(0, 8)}</p>
          </div>
          <button className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
        </header>

        <main className="pt-16 pb-20 space-y-px">
          {chapter.data.map((page: string, index: number) => (
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
            <Info className="w-3.5 h-3.5" /> {chapter.data.length} Frames Loaded
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    console.error('[Page Error] Reader Failure:', err);
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Signal Lost</h1>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-xs leading-relaxed">
          The transmission was interrupted. This usually occurs when the MangaDex node is under heavy load.
        </p>
        <Link href="/" className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Return to Base</Link>
      </div>
    );
  }
}
