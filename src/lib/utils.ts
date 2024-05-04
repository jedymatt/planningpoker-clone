import { Room } from '@/lib/schemas';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function distributeSeat<T>(players: T[]) {
  const top: T[] = [];
  const bottom: T[] = [];
  const left: T[] = [];
  const right: T[] = [];

  players.forEach((player, index) => {
    if (index === 0) {
      bottom.push(player);
      return;
    }

    if (index === 6) {
      left.push(player);
      return;
    }

    if (index === 7) {
      right.push(player);
      return;
    }

    const addToBottom = top.length > bottom.length;

    if (addToBottom) {
      bottom.push(player);
    } else {
      top.push(player);
    }
  });

  return { top, bottom, left, right };
}
