'use client';

import { cn } from '@/lib/utils';

type CardState = 'reveal' | 'hide';

type CardProps = {
  state: CardState;
  value?: string | null;
  className?: string;
};

export function Card({ state, value, className }: CardProps) {
  if (value == null) {
    return (
      <div
        className={cn('h-20 w-12 bg-gray-200 border rounded-md', className)}
      ></div>
    );
  }

  if (state === 'reveal') {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center w-12 h-20 border-2 border-blue-500 rounded-md',
          className,
        )}
      >
        <div className="absolute flex items-center justify-center w-full h-full text-lg font-bold text-blue-500">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('h-20 w-12 bg-blue-400 border rounded-md', className)}
    ></div>
  );
}
