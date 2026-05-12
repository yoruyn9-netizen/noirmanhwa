
'use client';

import React, { useState } from 'react';

interface ChapterImageProps {
  baseUrl: string;
  chapterHash: string;
  fileName: string;
  pageNum: number;
}

export default function ChapterImage({ baseUrl, chapterHash, fileName, pageNum }: ChapterImageProps) {
  const [error, setError] = useState(false);
  
  // data-saver is much faster for mobile devices and more reliable
  const imageUrl = `${baseUrl}/data-saver/${chapterHash}/${fileName}`;

  if (error) {
    return (
      <div className="w-full aspect-[2/3] max-w-2xl bg-neutral-950 flex flex-col items-center justify-center border-y border-white/5 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-accent/20 animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-700">Frame {pageNum} Sync Failed</span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl bg-neutral-900/10">
      <img
        src={imageUrl}
        alt={`Page ${pageNum}`}
        className="w-full h-auto block"
        loading="lazy"
        onError={() => {
          console.warn(`[Image Error] Failed to sync frame: ${pageNum}`);
          setError(true);
        }}
      />
    </div>
  );
}
