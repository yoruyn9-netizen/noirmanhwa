
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
  
  // data-saver is much faster for mobile devices
  const imageUrl = `${baseUrl}/data-saver/${chapterHash}/${fileName}`;

  if (error) {
    return (
      <div className="w-full h-64 bg-neutral-950 flex items-center justify-center border-y border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Page {pageNum} Error</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <img
        src={imageUrl}
        alt={`Page ${pageNum}`}
        className="w-full h-auto block"
        loading="lazy"
        onError={() => {
          console.error(`[Page Error] Failed to load: ${imageUrl}`);
          setError(true);
        }}
      />
    </div>
  );
}
