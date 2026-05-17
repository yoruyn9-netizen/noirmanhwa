"use client";

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Manga } from '@/lib/mangaApi'; // Assuming you have a way to get manga details by id
import Link from 'next/link';

interface ContinueReadingProps {
    mangaList: Manga[]; // You would fetch this based on the reading history
}

export default function ContinueReading({ mangaList }: ContinueReadingProps) {
    const { user } = useAuthStore();

    if (!user || !user.readingHistory || user.readingHistory.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-bold">Continue Reading</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {user.readingHistory.slice(0, 5).map(history => {
                    // This assumes you have a way to get manga details from history.mangaId
                    // For now, we will use a placeholder
                    return (
                        <Link href={`/manga/${history.mangaId}/${history.chapterId}?page=${history.lastReadPage}`} key={history.mangaId}>
                            <div className="border border-gray-700 rounded-lg p-4">
                                <h3 className="font-bold">{history.mangaId}</h3>
                                <p>Chapter {history.chapterId}</p>
                                <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${history.progressPercent}%`}}></div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
