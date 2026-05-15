
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
    requirement: 'Active User',
    color: '#c2410c'
  },
  {
    id: 'silver-shimmer',
    name: 'Silver Knight',
    tier: 'silver',
    cssClass: 'border-animate-shimmer border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.6)]',
    requirement: 'Premium Node',
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
  }
];

export function getBorderById(id: string): any {
  // Check local static borders
  const staticBorder = BORDERS.find(b => b.id === id);
  if (staticBorder) return staticBorder;

  // Handle dynamic custom borders (usually fetched from Firestore in a real app, 
  // but for immediate UI we return a structured object if the ID format matches)
  if (id.startsWith('custom-')) {
    return {
      id,
      name: 'Custom Fabricated',
      tier: 'special',
      imageUrl: id.replace('custom-', ''),
      cssClass: '',
      color: '#fff'
    };
  }

  return BORDERS[0];
}
