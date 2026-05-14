"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  hasMore,
  onLoadMore,
  isLoading
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="space-y-8 pt-8 pb-10">
      {/* Page Numbers */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent hover:bg-accent hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 2 + i;
            }
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-10 h-10 rounded-xl font-black text-[11px] transition-all",
                  currentPage === pageNum 
                    ? "bg-accent text-white shadow-lg shadow-accent/40" 
                    : "bg-white/5 text-neutral-500 hover:bg-white/10 hover:text-white"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent hover:bg-accent hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Load More & Stats */}
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
            Displaying {startIndex + 1}-{endIndex} of {totalItems} local nodes
          </p>
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="mt-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Synchronizing...' : 'Load 20 More Units'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/5 rounded-full">
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-neutral-500 uppercase">Sector</span>
              <span className="text-[10px] font-black text-accent">{currentPage} / {totalPages}</span>
           </div>
           <div className="w-px h-3 bg-white/10" />
           <div className="flex items-center gap-2">
              <LayoutGrid className="w-3 h-3 text-neutral-500" />
              <span className="text-[10px] font-black text-white">{totalItems} Total</span>
           </div>
        </div>
      </div>
    </div>
  );
}