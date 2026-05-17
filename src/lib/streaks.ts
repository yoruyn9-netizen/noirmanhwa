import { updateUserProfile } from './firestore';
import { UserProfile } from '@/types/user';

const MILESTONES: { [key: number]: { badgeId: string, title: string, reward?: () => Partial<UserProfile> } } = {
    1: { badgeId: 'newcomer', title: 'Newcomer' },
    3: { badgeId: 'active_reader', title: 'Active Reader' },
    7: { 
        badgeId: 'seven_day_warrior', 
        title: '7-Day Warrior', 
        reward: () => ({ premiumExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) }) // 1 day premium
    },
    14: { badgeId: 'dedicated_fan', title: 'Dedicated Fan' },
    30: { badgeId: 'legend', title: 'Legend' }, // Custom title unlock handled in UI
    100: { 
        badgeId: 'immortal', 
        title: 'Immortal', 
        reward: () => ({ premiumExpiry: new Date('2099-12-31') }) // Permanent premium
    },
};

export const handleLoginStreak = async (user: UserProfile) => {
    const today = new Date();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate as any) : null;
    let streak = user.loginStreak || 0;
    let totalLogins = user.totalLoginDays || 0;
    let badges = user.badges || [];
    let updateData: Partial<UserProfile> = {};

    if (lastLogin) {
        const diff = today.getTime() - lastLogin.getTime();
        const hoursDiff = diff / (1000 * 3600);

        if (hoursDiff > 48) {
            streak = 1; // Reset streak
        } else if (hoursDiff > 24) {
            streak += 1; // Increment streak
            totalLogins += 1;
        }
    } else {
        streak = 1;
        totalLogins = 1;
    }

    updateData.loginStreak = streak;
    updateData.totalLoginDays = totalLogins;
    updateData.lastLoginDate = today;

    // Check for milestone
    const milestone = MILESTONES[streak];
    if (milestone && !badges.includes(milestone.badgeId)) {
        badges.push(milestone.badgeId);
        updateData.badges = badges;
        updateData.currentTitle = milestone.title;

        if (milestone.reward) {
            Object.assign(updateData, milestone.reward());
        }
        // TODO: Send notification about new badge
    }

    await updateUserProfile(user.uid, updateData);
    return updateData; // Return the changes
};