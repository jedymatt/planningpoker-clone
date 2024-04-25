'use client';

import { useRoomContext } from '@/app/[room]/room';
import { useAuthContext } from '@/app/auth';
import { joinRoom } from '@/lib/dbQueries';
import { distributeSeat } from '@/lib/utils';
import { Card } from '@/app/_ui/card';
import { StartVotingButton } from '@/app/[room]/startVotingButton';
import { RevealCardsButton } from '@/app/[room]/revealCardsButton';
import { CardPicker } from '@/app/[room]/cardPicker';
import { motion } from 'framer-motion';
import { VotingResultSection } from '@/app/[room]/votingResultSection';
import { DisplayNameDialog } from '@/app/[room]/displayNameDialog';

export default function RoomPage() {
  const room = useRoomContext()!;
  const user = useAuthContext()!;

  if (
    user.displayName &&
    room &&
    !room.players.some((pl) => pl.userId === user.uid)
  ) {
    joinRoom(
      {
        uid: user.uid,
        displayName: user.displayName,
      },
      room.id,
    ).then(() => console.log('joined'));
  }

  const { top, bottom, left, right } = distributeSeat(room.players);

  const cardRenderer = (player: { userId: string; displayName: string }) => (
    <Card
      key={player.userId}
      state={room.revealCards ? 'reveal' : 'hide'}
      playerName={player.displayName}
      value={room.votes[player.userId]}
    />
  );

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
            {top.map((player) => cardRenderer(player))}
          </div>
          <div></div>
          <div className="flex justify-end">
            {left.map((player) => cardRenderer(player))}
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
            {right.map((player) => cardRenderer(player))}
          </div>
          <div></div>
          <div className="flex justify-around px-12 gap-x-12">
            {bottom.map((player) => cardRenderer(player))}
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
