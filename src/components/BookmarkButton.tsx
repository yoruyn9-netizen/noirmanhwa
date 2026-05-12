
"use client";

import React from 'react';
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  manga: any;
}

/**
 * A functional bookmark button that toggles a manga in the user's library.
 * Integrated with the global UI store for persistence.
 */
export default function BookmarkButton({ manga }: BookmarkButtonProps) {
  const { bookmarks, addBookmark, removeBookmark } = useUIStore();
  const { toast } = useToast();
  
  const isBookmarked = bookmarks.some((b) => b.id === manga.id);

  const handleToggle = () => {
    if (isBookmarked) {
      removeBookmark(manga.id);
      toast({
        title: "Archive Purged",
        description: "Node removed from local library.",
      });
    } else {
      addBookmark(manga);
      toast({
        title: "Protocol Synced",
        description: "Node successfully archived in library.",
      });
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 shadow-xl active:scale-95 w-full",
        isBookmarked 
          ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" 
          : "bg-accent text-white shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02]"
      )}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="w-4 h-4 text-accent" />
          ARCHIVED
        </>
      ) : (
        <>
          <BookmarkPlus className="w-4 h-4" />
          ARCHIVE DATA
        </>
      )}
    </button>
  );
}
