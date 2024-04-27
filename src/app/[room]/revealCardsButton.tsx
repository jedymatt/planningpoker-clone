import { useRoomContext } from '@/app/[room]/roomContext';
import { revealCards } from '@/lib/dbQueries';

export function RevealCardsButton() {
  const room = useRoomContext()!;

  return (
    <button
      onClick={async () => {
        await revealCards(room.id);
      }}
      className="px-4 py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-400/90 transition-all"
    >
      Reveal cards
    </button>
  );
}
