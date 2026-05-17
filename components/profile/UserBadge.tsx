
import React from 'react';
import { Crown, ShieldCheck, Star, User } from 'lucide-react';

interface UserBadgeProps {
  role: string;
  streak: number;
  className?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ role, streak, className }) => {
  const getBadge = () => {
    switch (role) {
      case 'Owner':
        return <Crown className={`w-5 h-5 text-yellow-400 ${className}`} />;
      case 'Admin':
        return <ShieldCheck className={`w-5 h-5 text-blue-500 ${className}`} />;
      case 'Premium':
        return <Star className={`w-5 h-5 text-purple-500 ${className}`} />;
      default:
        if (streak >= 100) return <span className={`text-lg ${className}`}>💎</span>;
        if (streak >= 30) return <span className={`text-lg ${className}`}>🔥</span>;
        if (streak >= 14) return <span className={`text-lg ${className}`}>🌟</span>;
        if (streak >= 7) return <span className={`text-lg ${className}`}>✨</span>;
        if (streak >= 3) return <span className={`text-lg ${className}`}>👍</span>;
        return <User className={`w-5 h-5 text-gray-400 ${className}`} />;
    }
  };

  return <div className="ml-2">{getBadge()}</div>;
};

export default UserBadge;
