"use client";
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { truncateTitle } from '@/lib/utils';

export default function MangaCardCompact({ manga }: { manga: any }) {
  return (
    <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block group select-none">
      <div className="aspect-[2/3] w-full relative rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/5 group-hover:border-accent/30 transition-all duration-500">
        <SafeImage src={manga.cover} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
      </div>
      <h4 className="mt-2 text-[9px] font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors line-clamp-1">
        {truncateTitle(manga.title, 20)}
      </h4>
    </Link>
  );
}