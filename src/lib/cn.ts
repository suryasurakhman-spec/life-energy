// src/lib/cn.ts
// Utility for merging Tailwind/NativeWind class names.
// Combines clsx (conditional classes) with tailwind-merge (deduplication).

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
