import { useRoomContext } from '@/app/[room]/roomContext';
import { SelectableCardButton } from '@/app/_ui/selectableCardButton';
import { updatePlayerCard } from '@/lib/dbQueries';
import { cn } from '@/lib/utils';
import { HTMLProps } from 'react';
import { useUserContext } from '../userContext';

export function CardPicker({ className, ...props }: HTMLProps<HTMLDivElement>) {
  const room = useRoomContext()!;
  const user = useUserContext()!;

  const selectedCard = user ? room.votes[user.id] : null;

  return (
    <div
      {...props}
      className={cn('absolute flex gap-4 bottom-4 justify-evenly', className)}
    >
      {room.cards.map((card, idx) => (
        <SelectableCardButton
          key={idx}
          onClick={async (value) => {
            if (user) {
              await updatePlayerCard(room.id, user.id, value);
            }
          }}
          selected={selectedCard === card}
          value={card}
        />
      ))}
    </div>
  );
}
