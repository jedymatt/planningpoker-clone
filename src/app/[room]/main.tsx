'use client';

import { useRoomContext } from '@/app/[room]/room';
import { Card } from '@/app/_ui/Card';
import { TextField } from '@/app/_ui/TextField';
import { useAuthContext } from '@/app/auth';
import {
  joinRoom,
  revealCards,
  startVoting,
  updatePlayerCard,
  updateRoom,
} from '@/lib/dbQueries';
import { auth } from '@/lib/firebase';
import { cn, distributeSeat } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { mean, round, uniq } from 'lodash';
import { HTMLProps } from 'react';
import { LoadingRoomScreen } from '../_ui/LoadingRoomScreen';

function StartVotingButton() {
  const room = useRoomContext()!;

  return (
    <button
      onClick={async () => {
        await startVoting(room.id);
      }}
      className="px-4 py-2 font-bold text-white rounded bg-slate-600 hover:bg-slate-800"
    >
      Start new voting
    </button>
  );
}

function RevealCardsButton() {
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

function SelectableCardButton(props: {
  onClick?: (value: string | null) => void;
  selected?: boolean;
  value: string;
}) {
  const onClick =
    props.onClick &&
    (() => props.onClick!(props.selected ? null : props.value));

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-12 h-20 border-2 border-blue-500 rounded-md transition-all',
        props.selected
          ? 'bg-blue-500 text-white -translate-y-2'
          : 'hover:-translate-y-1 text-blue-500 hover:bg-blue-50',
      )}
    >
      <div
        className={cn(
          'absolute flex items-center justify-center w-full h-full text-lg font-bold',
        )}
      >
        {props.value}
      </div>
    </button>
  );
}

function CardPicker({ className, ...props }: HTMLProps<HTMLDivElement>) {
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

function DisplayNameForm() {
  const room = useRoomContext()!;
  const onSubmit = async (e: FormData) => {
    await updateProfile(auth.currentUser!, {
      displayName: e.get('displayName') as string,
    });
    await updateRoom(room.id, {
      ...room,
      players: [
        ...room.players.filter((pl) => pl.userId !== auth.currentUser!.uid),
        {
          userId: auth.currentUser!.uid,
          displayName: auth.currentUser!.displayName!,
        },
      ],
    });
  };

  return (
    <form action={onSubmit}>
      <div className="font-bold text-slate-900 text-2xl">
        Choose your display name
      </div>
      <div className="mt-6">
        <TextField
          type="text"
          name="displayName"
          label="Your display name"
          className="mt-1 w-full border border-slate-200 rounded-md"
          required
        />
      </div>
      <div className="mt-6">
        <button className="w-full bg-blue-500 text-white px-3 py-2 rounded-md font-bold disabled:bg-gray-300">
          Continue to game
        </button>
      </div>
    </form>
  );
}

function DisplayNameDialog() {
  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-cyan-950/50 fixed inset-0" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border px-8 py-16">
          <DisplayNameForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VotingResultSection({
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const room = useRoomContext()!;

  const votes = Object.values(room.votes);
  const result = uniq(votes)
    .filter((e): e is string => e !== undefined && e !== null)
    .reduce(
      (acc, value) => {
        return [
          ...acc,
          {
            vote: value,
            count: votes.filter((e) => e === value).length,
          },
        ];
      },
      [] as { vote: string; count: number }[],
    )
    .sort((a, b) => room.cards.indexOf(a.vote) - room.cards.indexOf(b.vote));

  const totalValidVotes = result.reduce((acc, { count }) => acc + count, 0);
  const highestVoteCount = Math.max(...result.map((e) => e.count));
  const numbersInVote = votes.map((e) => Number(e)).filter((e) => !isNaN(e));
  const canCalculateAverage = numbersInVote.length > 0;

  // FIXME: Temporarily disabled due to flickering issue
  // confetti({
  //   position: {
  //     x: 50,
  //     y: 100,
  //   },
  //   count: 20,
  //   spread: 120,
  // });

  return (
    <div {...props} className={cn('flex', className, 'voting-result-section')}>
      <div className="flex items-center gap-4">
        {result.map(({ vote, count }) => {
          const percentOfVoters = count / totalValidVotes;
          const maxHeight = 80; // 80px ~ 5rem ~ h-20
          const filledHeight = Math.round(maxHeight * percentOfVoters);
          const isHighest = highestVoteCount === count;
          return (
            <div key={vote} className="flex flex-col items-center gap-y-2">
              <div
                style={{ height: maxHeight }}
                className="w-2 relative bg-gray-200 rounded overflow-clip"
              >
                <div
                  style={{
                    height: filledHeight,
                  }}
                  className={cn(
                    'absolute bottom-0 inset-x-0 rounded bg-neutral-400',
                    isHighest && 'bg-slate-800',
                  )}
                ></div>
              </div>
              <div
                className={cn(
                  'h-20 w-12 border-2 rounded-md flex justify-center items-center border-neutral-400',
                  isHighest && 'border-slate-800',
                )}
              >
                <span
                  className={cn(
                    'font-bold text-neutral-400',
                    isHighest && 'text-slate-800',
                  )}
                >
                  {vote}
                </span>
              </div>
              <span
                className={cn(
                  'text-neutral-400',
                  isHighest && 'text-slate-700',
                )}
              >
                {count} Vote{count > 1 && 's'}
              </span>
            </div>
          );
        })}
      </div>
      {canCalculateAverage && (
        <div className="ml-16 flex text-center flex-col items-center justify-center">
          <span className="text-lg text-gray-700">Average:</span>
          <div className="mt-2">
            <span className="text-3xl font-bold">
              {round(mean(numbersInVote), 1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainPage() {
  const room = useRoomContext();
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

  if (!room) {
    return <LoadingRoomScreen />;
  }

  const { top, bottom, left, right } = distributeSeat(room.players);

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
              <Card
                key={player.userId}
                state={room.revealCards ? 'reveal' : 'hide'}
                playerName={player.displayName}
                value={room.votes[player.userId]}
              />
            ))}
          </div>
          <div></div>
          <div className="flex justify-end">
            {left.map((player) => (
              <Card
                key={player.userId}
                state={room.revealCards ? 'reveal' : 'hide'}
                playerName={player.displayName}
                value={room.votes[player.userId]}
              />
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
              <Card
                key={player.userId}
                state={room.revealCards ? 'reveal' : 'hide'}
                playerName={player.displayName}
                value={room.votes[player.userId]}
              />
            ))}
          </div>
          <div></div>
          <div className="flex justify-around px-12 gap-x-12">
            {bottom.map((player) => (
              <Card
                key={player.userId}
                state={room.revealCards ? 'reveal' : 'hide'}
                playerName={player.displayName}
                value={room.votes[player.userId]}
              />
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
