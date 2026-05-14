
"use client";

import React from 'react';
import { Crown, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showText?: boolean;
}

export default function RoleBadge({ role, className, showText = true }: RoleBadgeProps) {
  const config = {
    owner: {
      icon: Crown,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "OWNER"
    },
    admin: {
      icon: ShieldCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "ADMIN"
    },
    user: {
      icon: User,
      color: "text-neutral-500",
      bg: "bg-neutral-500/10",
      border: "border-neutral-500/20",
      text: "USER"
    }
  };

  const { icon: Icon, color, bg, border, text } = config[role] || config.user;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest",
      bg, border, color, className
    )}>
      <Icon className="w-2.5 h-2.5" />
      {showText && text}
    </div>
  );
}
