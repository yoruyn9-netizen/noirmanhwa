"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, isThisWeek, parseISO, startOfDay } from 'date-fns';
import { AlertTriangle, CalendarDays, Clock3, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  title: string;
  image?: string;
  publishedFrom?: string | null;
  chapters?: number | string | null;
  url?: string;
}

type ScheduleGroup = 'Today' | 'Tomorrow' | 'This Week' | 'Later';

function formatPublishedDate(value?: string | null) {
  if (!value) return 'Unknown date';

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';

  return format(parsed, 'dd MMM yyyy HH:mm');
}

function getScheduleGroup(value?: string | null): ScheduleGroup {
  if (!value) return 'Later';

  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return 'Later';

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'This Week';

  return 'Later';
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedule = useCallback(async () => {
    setError(null);
    setRefreshing(true);

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
        throw new Error(payload.error || 'Invalid schedule data received');
      }

      const normalized: ScheduleItem[] = payload.data.map((item: any) => ({
        id: String(item.id || item.url || `${item.title}-${item.publishedFrom}`),
        title: item.title || 'Untitled',
        image: item.image || item.imageUrl || item.cover || '',
        publishedFrom: item.publishedFrom || item.published_from || item.published?.from || null,
        chapters: item.chapters ?? item.chapter ?? item.latestChapter ?? 'N/A',
        url: item.url || item.link || ''
      }));

      normalized.sort((a, b) => {
        const aDate = a.publishedFrom ? parseISO(a.publishedFrom).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.publishedFrom ? parseISO(b.publishedFrom).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      });

      setSchedule(normalized);
      setLoading(false);
    } catch (err: any) {
      console.error('[Schedule Page]', err);
      setError(err.message || 'Failed to fetch schedule');
      setSchedule([]);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
    const interval = window.setInterval(loadSchedule, 300000);
    return () => window.clearInterval(interval);
  }, [loadSchedule]);

  const groupedSchedule = useMemo(() => {
    const groups: Record<ScheduleGroup, ScheduleItem[]> = {
      Today: [],
      Tomorrow: [],
      'This Week': [],
      Upcoming: []
    };

    schedule.forEach((item) => {
      const group = getScheduleGroup(item.publishedFrom);
      groups[group].push(item);
    });

    return Object.entries(groups).filter(([, items]) => items.length) as [ScheduleGroup, ScheduleItem[]][];
  }, [schedule]);

  return (
    <div className="min-h-screen pb-32 pt-10 px-4 md:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.45em] text-accent">SCHEDULE</p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">Release Schedule</h1>
            <p className="max-w-2xl text-sm text-neutral-400 uppercase tracking-[0.3em]">Auto-refreshes every 5 minutes and groups releases by date.</p>
          </div>

          <button
            onClick={loadSchedule}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <section key={idx} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/10 animate-pulse">
                <div className="mb-4 h-48 rounded-3xl bg-white/10" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded-full bg-white/10" />
                  <div className="h-4 w-1/2 rounded-full bg-white/10" />
                  <div className="h-4 w-2/3 rounded-full bg-white/10" />
                </div>
              </section>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-10 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-red-400">Unable to load schedule</p>
            <p className="mt-3 text-[11px] text-neutral-400">{error}</p>
            <button
              onClick={loadSchedule}
              className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:brightness-110 transition"
            >
              Retry
            </button>
          </div>
        ) : groupedSchedule.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-14 text-center">
            <p className="text-base font-black uppercase tracking-[0.35em] text-white">No releases scheduled</p>
            <p className="mt-3 text-[11px] text-neutral-500">Please check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedSchedule.map(([groupLabel, items]) => (
              <section key={groupLabel} className="space-y-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-accent">{groupLabel}</p>
                    <p className="mt-2 text-lg font-black uppercase tracking-tight text-white">{items.length} release{items.length === 1 ? '' : 's'}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-neutral-300">
                    <CalendarDays className="w-4 h-4 text-accent" /> grouped by date
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0d13]/90 shadow-2xl transition hover:border-accent/40">
                      <div className="relative overflow-hidden bg-[#050508]">
                        <img
                          src={item.image || '/placeholder-image.png'}
                          alt={item.title}
                          className="h-52 w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-4 p-5">
                        <div className="space-y-2">
                          <h2 className="text-base font-black uppercase tracking-tight text-white line-clamp-2">{item.title}</h2>
                          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="w-3.5 h-3.5 text-accent" /> {formatPublishedDate(item.publishedFrom)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="w-3.5 h-3.5 text-accent" /> Chapter {item.chapters ?? 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-wrap gap-3">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
                            >
                              View Details
                            </a>
                          ) : (
                            <span className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400">
                              No link available
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
