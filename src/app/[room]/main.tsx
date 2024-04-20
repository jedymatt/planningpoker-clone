'use client';

import {
  joinRoom,
  revealCards,
  signInAnon,
  startVoting,
  updatePlayerCard,
} from '@/lib/dbQueries';
import { cn, distributeSeat } from '@/lib/utils';
import { useFormStatus } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useRoomContext } from '@/app/[room]/room';
import { useAuthContext } from '@/app/auth';
import { Card } from '@/app/[room]/card';
import { meanBy, round, sumBy, uniq } from 'lodash';

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
      className="px-4 py-2 font-bold text-white rounded bg-slate-600 hover:bg-slate-800"
    >
      Reveal Cards
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
        'relative flex items-center justify-center w-16 h-24 border-2 border-blue-500 rounded-md transition-all',
        props.selected
          ? 'bg-blue-500 text-white -translate-y-2'
          : 'hover:-translate-y-1 text-blue-500 hover:bg-blue-50',
      )}
    >
      <div
        className={cn(
          'absolute flex items-center justify-center w-full h-full text-2xl font-bold',
        )}
      >
        {props.value}
      </div>
    </button>
  );
}

function CardPicker() {
  const room = useRoomContext()!;
  const user = useAuthContext();

  const selectedCard = user ? room.votes[user!.uid] : null;

  return (
    <div className="absolute flex gap-4 bottom-4 justify-evenly">
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

function LoginForm() {
  const { pending } = useFormStatus();

  const onSubmit = async (e: FormData) => {
    const displayName = e.get('displayName')! as string;
    await signInAnon(displayName);
  };

  return (
    <form action={onSubmit} className="border px-10 py-16 shadow-md rounded-md">
      <div className="font-bold text-slate-900 text-2xl">
        Choose your display name
      </div>
      <div className="mt-6">
        <label>
          <span className="text-xs text-slate-700">Your display name</span>
          <input
            type="text"
            name="displayName"
            className="mt-1 w-full border border-slate-200 rounded-md p-2"
          />
        </label>
      </div>
      <div className="mt-6">
        <button
          className="w-full bg-blue-500 text-white px-3 py-2 rounded-md font-bold disabled:bg-gray-300"
          disabled={pending}
        >
          Continue to game
        </button>
      </div>
    </form>
  );
}

function LoginDialog({ show }: { show: boolean }) {
  return (
    <Dialog.Root open={show}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-800/10 fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <LoginForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VotingResultSection() {
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
  const canCalculateAverage = votes.every((e) => !isNaN(Number(e)));

  return (
    <div className="flex">
      <div className="flex items-center gap-4">
        {result.map(({ vote, count }) => {
          const percentOfVoters = count / totalValidVotes;
          const maxHeight = 80; // 80px ~ 5rem ~ h-20
          const filledHeight = Math.round(maxHeight * percentOfVoters);
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
                  className="absolute bottom-0 inset-x-0 bg-slate-800 rounded"
                ></div>
              </div>
              <div className="h-20 w-12 border-2 border-slate-800 rounded-md flex justify-center items-center">
                <span className="font-semibold text-slate-800">{vote}</span>
              </div>
              <span className="text-slate-700">
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
              {round(
                meanBy(votes, (e) => Number(e)),
                1,
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainPage() {
  const room = useRoomContext();
  const user = useAuthContext();
  // const [showingInviteModal, setShowingInviteModal] = useState(false);

  if (!room) {
    return <div>Loading...</div>;
  }

  if (user && !room.players.some((pl) => pl.userId === user.uid)) {
    joinRoom(user, room.id);
  }

  const { top, bottom, left, right } = distributeSeat(room.players);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center">
        <div
          style={{
            gridTemplateColumns: '8rem 1fr 8rem',
            gridTemplateRows: 'auto 1fr auto',
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
              {room.revealCards ? <StartVotingButton /> : <RevealCardsButton />}
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
      {!room.revealCards && (
        <div className="flex justify-center items-center bg-white">
          <CardPicker />
        </div>
      )}

      {room.revealCards && (
        <div className="flex justify-center items-center py-4">
          <VotingResultSection />
        </div>
      )}
      <LoginDialog show={!user} />
    </div>
  );
}
