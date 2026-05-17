import { updateUserProfile } from './firestore';
import { UserProfile } from '@/types/user';

interface ReadingHistoryItem {
    mangaId: string;
    chapterId: string;
    lastReadPage: number;
    progressPercent: number;
    timestamp: Date;
}

export const saveReadingProgress = async (
    user: UserProfile,
    mangaId: string,
    chapterId: string,
    lastReadPage: number,
    totalPages: number
) => {
    if (!user) return;

    const progressPercent = Math.round((lastReadPage / totalPages) * 100);
    const now = new Date();

    const historyItem: ReadingHistoryItem = {
        mangaId,
        chapterId,
        lastReadPage,
        progressPercent,
        timestamp: now,
    };

    let history = user.readingHistory || [];

    // Remove existing entry for the same manga to avoid duplicates
    history = history.filter(item => item.mangaId !== mangaId);

    // Add the new progress to the beginning of the array
    history.unshift(historyItem);

    // Keep only the last 20 history items
    history = history.slice(0, 20);

    await updateUserProfile(user.uid, { readingHistory: history });

    return history;
};