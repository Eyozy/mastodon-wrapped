import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// App State
export const AppState = {
  LANDING: 'landing',
  LOADING: 'loading',
  STATS: 'stats',
};

// Timezone Mode
export const TimezoneMode = {
  LOCAL: 'local',
  UTC: 'utc',
};

// Language
export const Lang = {
  EN: 'en',
  ZH: 'zh',
};
