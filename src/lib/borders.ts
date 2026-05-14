
import { Border } from '@/types/border';

export const BORDERS: Border[] = [
  {
    id: 'none',
    name: 'No Border',
    tier: 'default',
    cssClass: '',
    requirement: 'Standard User',
    color: 'transparent'
  },
  {
    id: 'bronze-glow',
    name: 'Bronze Warrior',
    tier: 'bronze',
    cssClass: 'border-animate-pulse border-orange-700/50 shadow-[0_0_10px_rgba(194,65,12,0.5)]',
    requirement: 'Active User (7+ Days)',
    color: '#c2410c'
  },
  {
    id: 'silver-shimmer',
    name: 'Silver Knight',
    tier: 'silver',
    cssClass: 'border-animate-shimmer border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.6)]',
    requirement: 'Premium Subscriber',
    color: '#cbd5e1'
  },
  {
    id: 'gold-admin',
    name: 'Golden Sentinel',
    tier: 'gold',
    cssClass: 'border-animate-glow border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]',
    requirement: 'Admin Authority',
    color: '#fac015'
  },
  {
    id: 'legend-owner',
    name: 'Celestial Legend',
    tier: 'legend',
    cssClass: 'border-animate-rotate border-gradient-legend shadow-[0_0_25px_rgba(168,85,247,0.9)]',
    requirement: 'Supreme Owner',
    color: '#a855f7'
  },
  {
    id: 'blood-special',
    name: 'Crimson Vanguard',
    tier: 'special',
    cssClass: 'border-animate-pulse border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.7)]',
    requirement: 'Manually Assigned',
    color: '#dc2626'
  }
];

export function getBorderById(id: string): Border {
  return BORDERS.find(b => b.id === id) || BORDERS[0];
}
