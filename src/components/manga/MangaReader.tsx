"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { saveReadingProgress } from '@/lib/reading-progress';
import { throttle } from 'lodash';

// Dummy props, replace with your actual props
interface MangaReaderProps {
  mangaId: string;
  chapterId: string;
  pages: string[]; // Array of image URLs
}

export default function MangaReader({ mangaId, chapterId, pages }: MangaReaderProps) {
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSaveProgress = useCallback(
    throttle((page: number) => {
      if (user) {
        saveReadingProgress(user, mangaId, chapterId, page, pages.length);
      }
    }, 5000), // Save every 5 seconds
    [user, mangaId, chapterId, pages.length]
  );

  useEffect(() => {
    // Here you would have your logic to change pages
    // For demonstration, let's just assume the user is scrolling
    // and we are updating the currentPage state.
    const handleScroll = () => {
      // Your logic to determine the current page from scroll position
      const newPage = 1; // dummy value
      setCurrentPage(newPage);
      throttledSaveProgress(newPage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttledSaveProgress]);

  return (
    <div>
      {pages.map((page, index) => (
        <img key={index} src={page} alt={`Page ${index + 1}`} />
      ))}
      <div className="fixed bottom-0 left-0 p-4 bg-black/50 text-white">
        Page {currentPage} of {pages.length}
      </div>
    </div>
  );
}
