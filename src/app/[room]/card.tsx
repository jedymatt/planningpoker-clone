'use client';

type CardState = 'reveal' | 'hide';

type CardProps = {
  playerName: string;
  state: CardState;
  value?: string | null;
};

export function Card({ playerName, state, value }: CardProps) {
  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="h-24 bg-gray-200 border rounded-md min-w-16"></div>
        <div className="mt-2 font-bold text-center">{playerName}</div>
      </div>
    );
  }

  if (state === 'reveal') {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-16 h-24 border-2 border-blue-500 rounded-md">
          <div className="absolute flex items-center justify-center w-full h-full text-2xl font-bold text-blue-500">
            {value}
          </div>
        </div>
        <div className="mt-2 font-bold text-center">{playerName}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-24 bg-blue-400 border rounded-md min-w-16"></div>
      <div className="mt-2 font-bold text-center">{playerName}</div>
    </div>
  );
}
