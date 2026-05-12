
import React from 'react';
import { mangaApi } from '@/lib/api';
import ReaderView from '@/components/ReaderView';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

/**
 * Server component that fetches all necessary chapter data for the reader.
 * Orchestrates chapter details, image servers, and navigation links.
 */
export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  console.log(`[Reader] Initializing Transmission for Chapter: ${chapterId}`);

  try {
    // 1. Fetch Chapter Metadata & Images
    const [atHomeRes, chapterRes] = await Promise.all([
      mangaApi.getAtHomeServer(chapterId),
      fetch(`https://api.mangadex.org/chapter/${chapterId}`, { next: { revalidate: 3600 } }).then(res => res.json())
    ]);

    if (!atHomeRes || atHomeRes.error || !atHomeRes.chapter) {
      throw new Error("Failed to initialize image server nodes.");
    }

    const { baseUrl, chapter: pagesData } = atHomeRes;
    const pages = pagesData.dataSaver?.length > 0 ? pagesData.dataSaver : pagesData.data;

    if (!pages || pages.length === 0) {
      throw new Error("Empty data stream detected in this sector.");
    }

    // 2. Fetch Navigation context (Manga ID -> Feed)
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
      <ReaderView 
        chapterId={chapterId}
        pages={pages}
        baseUrl={baseUrl}
        hash={pagesData.hash}
        chapterNum={chapterRes.data?.attributes?.chapter || 'N/A'}
        title={chapterRes.data?.attributes?.title}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
      />
    );
  } catch (err: any) {
    console.error('[Reader Error] Node Critical Failure:', err);
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-8 space-y-8 text-center">
        <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-10 h-10 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white text-glow">Signal Lost</h1>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] max-w-xs leading-relaxed opacity-60">
            {err.message || "Transmission interrupted by external node latency."}
          </p>
        </div>
        <Link 
          href="/" 
          className="px-12 py-5 bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl"
        >
          Return to Base
        </Link>
      </div>
    );
  }
}
