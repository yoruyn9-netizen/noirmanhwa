
import React from 'react';
import { mangaApi } from '@/lib/api';
import ReaderView from '@/components/ReaderView';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import ReaderHeaderAction from './ReaderHeaderAction'; // Separate client component for the button

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;

  try {
    const [atHomeRes, chapterRes] = await Promise.all([
      mangaApi.getAtHomeServer(chapterId),
      fetch(`https://api.mangadex.org/chapter/${chapterId}`, { next: { revalidate: 3600 } }).then(res => res.json())
    ]);

    if (!atHomeRes || atHomeRes.error || !atHomeRes.chapter) {
      throw new Error("Target node synchronization failure.");
    }

    const { baseUrl, chapter: pagesData } = atHomeRes;
    const pages = (pagesData.dataSaver && pagesData.dataSaver.length > 0) 
      ? pagesData.dataSaver 
      : (pagesData.data || []);

    const mangaRelationship = chapterRes.data?.relationships?.find((r: any) => r.type === 'manga');
    const mangaId = mangaRelationship?.id;
    
    let prevChapterId: string | null = null;
    let nextChapterId: string | null = null;

    if (mangaId) {
      const feedRes = await mangaApi.getChapters(mangaId);
      const chapters = feedRes.data || [];
      const currentIndex = chapters.findIndex((c: any) => c.id === chapterId);
      
      if (currentIndex !== -1) {
        prevChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : null;
        nextChapterId = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : null;
      }
    }

    return (
      <div className="relative">
        {/* We pass the report functionality through a component injected into the reader if necessary, 
            but for now, let's keep it simple by wrapping ReaderView or modifying it */}
        <ReaderView 
          chapterId={chapterId}
          pages={pages}
          baseUrl={baseUrl}
          hash={pagesData.hash}
          chapterNum={chapterRes.data?.attributes?.chapter || '?'}
          title={chapterRes.data?.attributes?.title}
          prevChapterId={prevChapterId}
          nextChapterId={nextChapterId}
          mangaId={mangaId}
        />
        {/* The ReaderView itself needs to handle the report button in its fixed header for the best UX */}
      </div>
    );
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Signal Lost</h1>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-[200px] leading-relaxed opacity-60">
            {err.message || "Uplink interrupted by node latency."}
          </p>
        </div>
        <Link 
          href="/" 
          className="px-12 py-5 bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em]"
        >
          Return Home
        </Link>
      </div>
    );
  }
}
