import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { Room } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function distributeSeat(players: Room['players']) {
  const top: Room['players'] = [];
  const bottom: Room['players'] = [];
  const left: Room['players'] = [];
  const right: Room['players'] = [];

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
