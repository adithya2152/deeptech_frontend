import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTierStyle(level: number = 1) {
  if (level >= 10) return {
    label: 'Diamond',
    gradient: 'from-cyan-300 via-blue-500 to-purple-600',
    border: 'border-blue-400',
    text: 'text-blue-900',
    bg: 'bg-blue-50',
    shadow: 'shadow-blue-200'
  };
  if (level >= 8) return {
    label: 'Platinum',
    gradient: 'from-slate-300 via-slate-100 to-slate-400',
    border: 'border-slate-300',
    text: 'text-slate-800',
    bg: 'bg-slate-50',
    shadow: 'shadow-slate-200'
  };
  if (level >= 5) return {
    label: 'Gold',
    gradient: 'from-amber-300 via-yellow-200 to-amber-400',
    border: 'border-amber-300',
    text: 'text-amber-900',
    bg: 'bg-amber-50',
    shadow: 'shadow-amber-200'
  };
  if (level >= 3) return {
    label: 'Silver',
    gradient: 'from-gray-300 via-gray-100 to-gray-300',
    border: 'border-gray-300',
    text: 'text-gray-800',
    bg: 'bg-gray-50',
    shadow: 'shadow-gray-200'
  };
  return {
    label: 'Bronze',
    gradient: 'from-orange-300 via-orange-100 to-orange-300',
    border: 'border-orange-300',
    text: 'text-orange-900',
    bg: 'bg-orange-50',
    shadow: 'shadow-orange-200'
  };
}
