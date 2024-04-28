'use client';

import { CardPicker } from '@/app/[room]/cardPicker';
import { DisplayNameDialog } from '@/app/[room]/displayNameDialog';
import { RevealCardsButton } from '@/app/[room]/revealCardsButton';
import { useRoomContext } from '@/app/[room]/roomContext';
import { StartVotingButton } from '@/app/[room]/startVotingButton';
import { VotingResultSection } from '@/app/[room]/votingResultSection';
import { Card } from '@/app/_ui/card';
import { joinRoom, kickPlayerFromRoom } from '@/lib/dbQueries';
import { cn, distributeSeat } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUserContext } from '../userContext';
import { useState } from 'react';
import { Room } from '@/lib/schemas';

export default function RoomPage() {
  const room = useRoomContext()!;
  const user = useUserContext()!;

  if (
    user.displayName &&
    room &&
    !room.players.some((pl) => pl.userId === user.id)
  ) {
    joinRoom(
      {
        id: user.id,
        displayName: user.displayName,
      },
      room.id,
    ).then(() => console.log('joined'));
  }

  const { top, bottom, left, right } = distributeSeat(room.players);

  const CardRenderer = ({ player }: { player: Room['players'][number] }) => {
    const [hovered, setHovered] = useState(false);
    const isOwnCard = player.userId === user.id;

    return (
      <div className="relative">
        <div
          className="flex flex-col justify-center items-center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Card
            className={cn(
              room.votes[player.userId] == null &&
                !isOwnCard &&
                hovered &&
                'bg-gray-300',
            )}
            state={room.revealCards ? 'reveal' : 'hide'}
            value={room.votes[player.userId]}
          />

          <div className="mt-2 font-bold text-center">{player.displayName}</div>
        </div>

        {!isOwnCard && hovered && (
          <div
            className="flex absolute top-0 left-0 translate-x-1/2 -translate-y-full justify-center h-min w-min"
            onMouseEnter={() => setHovered(true)}
          >
            <div
              className="flex justify-center hover:opacity-100 pb-2 "
              onMouseLeave={() => setHovered(false)}
              onClick={async () => {
                await kickPlayerFromRoom(player.userId, room.id);
              }}
            >
              <button className="rounded-full bg-red-500 h-12  w-12 flex justify-center items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-grow flex items-center justify-center transition-all transform">
        <div
          style={{
            gridTemplateColumns: '8rem 1fr 8rem',
            gridTemplateRows: '8rem 1fr 8rem',
          }}
          className="grid gap-4"
        >
          <div></div>
          <div className="flex justify-around px-12 gap-x-12">
            {top.map((player) => (
              <CardRenderer key={player.userId} player={player} />
            ))}
          </div>
          <div></div>
          <div className="flex justify-end">
            {left.map((player) => (
              <CardRenderer key={player.userId} player={player} />
            ))}
          </div>
          <div className="flex items-center justify-center bg-blue-100 auto-cols-max rounded-3xl min-h-48 min-w-72">
            <div>
              {room.revealCards && <StartVotingButton />}
              {!room.revealCards &&
                Object.values(room.votes).filter((e) => e !== null).length >
                  0 && <RevealCardsButton />}
              {Object.values(room.votes).filter((e) => e !== null).length ===
                0 && 'Pick your cards!'}
            </div>
          </div>
          <div className="flex">
            {right.map((player) => (
              <CardRenderer key={player.userId} player={player} />
            ))}
          </div>
          <div></div>
          <div className="flex justify-around px-12 gap-x-12">
            {bottom.map((player) => (
              <CardRenderer key={player.userId} player={player} />
            ))}
          </div>
          <div></div>
        </div>
      </div>

      <div className={'flex justify-center items-center py-4'}>
        {!room.revealCards && <CardPicker />}
        {room.revealCards && (
          <div className="overflow-clip flex justify-center items-center bg-stone-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <VotingResultSection />
            </motion.div>
          </div>
        )}
      </div>
      {!user.displayName && <DisplayNameDialog />}
    </div>
  );
}
