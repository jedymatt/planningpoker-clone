import {HTMLProps} from 'react';
import {useRoomContext} from '@/app/[room]/room';
import {useAuthContext} from '@/app/auth';
import {cn} from '@/lib/utils';
import {SelectableCardButton} from '@/app/_ui/selectableCardButton';
import {updatePlayerCard} from '@/lib/dbQueries';

export function CardPicker({className, ...props}: HTMLProps<HTMLDivElement>) {
    const room = useRoomContext()!;
    const user = useAuthContext();

    const selectedCard = user ? room.votes[user!.uid] : null;

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
                            await updatePlayerCard(room.id, user.uid, value);
                        }
                    }}
                    selected={selectedCard === card}
                    value={card}
                />
            ))}
        </div>
    );
}