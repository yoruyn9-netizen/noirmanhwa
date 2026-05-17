"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Clock3, Star, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatPublishedDate(value: string | null) {
  if (!value) return 'Tanggal tidak tersedia';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return format(date, 'dd MMM yyyy HH:mm');
}

interface ScheduleItem {
  id: string;
  title: string;
  imageUrl: string;
  publishedFrom: string | null;
  publishedTo: string | null;
  score: number | null;
  members: number | null;
  url: string;
  chapters: number | null;
  status: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/manga/schedule', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || `HTTP ${res.status}`);
      }
      const payload = await res.json();
      if (!payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.error || 'Invalid schedule payload');
      }
      setSchedule(payload.data);
    } catch (err: any) {
      console.error('[Schedule Page] Load failed', err);
      setError(err.message || 'Gagal memuat jadwal rilis');
      setSchedule([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
    const interval = setInterval(loadSchedule, 300000);
    return () => clearInterval(interval);
  }, [loadSchedule]);

  return (
    <div className="min-h-screen pb-32 pt-10 px-4 md:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.45em] text-accent">JADWAL RILIS</p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">Real-Time Jadwal Manhwa</h1>
            <p className="max-w-2xl text-sm text-neutral-400 uppercase tracking-[0.3em]">Sinkronisasi otomatis setiap 5 menit dengan sumber jadwal publik.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              loadSchedule();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> {refreshing ? 'Menyegarkan...' : 'Refresh Jadwal'}
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-72 animate-pulse rounded-[2rem] bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.4em] text-red-400">Gagal memuat jadwal</p>
            <p className="mt-3 text-[11px] text-neutral-400">{error}</p>
            <button
              type="button"
              onClick={loadSchedule}
              className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:brightness-110 transition"
            >
              Coba lagi
            </button>
          </div>
        ) : schedule.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-14 text-center">
            <p className="text-base font-black uppercase tracking-[0.35em] text-white">Belum ada jadwal rilis hari ini</p>
            <p className="mt-3 text-[11px] text-neutral-500">Silakan periksa kembali nanti untuk pembaruan terbaru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {schedule.map((item) => (
              <article key={item.id} className="group flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0f]/90 shadow-2xl transition hover:border-accent/40">
                <div className="relative overflow-hidden bg-[#050508]">
                  <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.35em] text-accent">
                      AIRING
                    </span>
                    <h2 className="mt-4 text-sm font-black uppercase tracking-tight text-white line-clamp-2">{item.title}</h2>
                  </div>

                  <div className="space-y-3 text-[10px] text-neutral-400">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 uppercase tracking-[0.25em]"><CalendarDays className="w-3.5 h-3.5 text-accent" /> Tanggal</span>
                      <span className="font-black text-white">{formatPublishedDate(item.publishedFrom)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 uppercase tracking-[0.25em]"><Star className="w-3.5 h-3.5 text-yellow-400" /> Skor</span>
                      <span className="font-black text-white">{item.score ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 uppercase tracking-[0.25em]"><Clock3 className="w-3.5 h-3.5 text-accent" /> Chapters</span>
                      <span className="font-black text-white">{item.chapters ?? 'N/A'}</span>
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'mt-auto inline-flex items-center justify-center rounded-2xl bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-white/10',
                      item.url ? 'opacity-100' : 'opacity-50 pointer-events-none'
                    )}
                  >
                    Lihat Detail
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
