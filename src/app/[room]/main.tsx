'use client';

import {
  joinRoom,
  revealCards,
  signInAnon,
  startVoting,
  updatePlayerCard,
} from '@/lib/dbQueries';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useRoomContext } from '@/app/[room]/room';
import { useAuthContext } from '@/app/auth';
import { Card } from '@/app/[room]/card';
import { Room } from '@/lib/types';

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
  const user = useAuthContext()!;

  const selectedCard = room.votes[user!.uid];

  return (
    <div className="absolute flex gap-4 bottom-4 justify-evenly">
      {room.cards.map((card, idx) => (
        <SelectableCardButton
          key={idx}
          onClick={async (value) => {
            await updatePlayerCard(room.id, user.uid, value);
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

  const topSide: Room['players'] = [];
  const bottomSide: Room['players'] = [];

  room.players.forEach((player, index) => {
    if (index % 2 === 0) {
      topSide.push(player);
    } else {
      bottomSide.push(player);
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        style={{
          gridTemplateColumns: '8rem 1fr 8rem',
          gridTemplateRows: 'auto 1fr auto',
        }}
        className="grid gap-4"
      >
        <div></div>
        <div className="flex justify-around px-12 gap-x-12">
          {topSide.map((player) => (
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
          {/*{leftSide.map((player) => (*/}
          {/*  <Card*/}
          {/*    key={player.userId}*/}
          {/*    state={room.revealCards ? 'reveal' : 'hide'}*/}
          {/*    playerName={player.displayName}*/}
          {/*    value={room.votes[player.userId]}*/}
          {/*  />*/}
          {/*))}*/}
        </div>
        <div className="flex items-center justify-center bg-blue-100 auto-cols-max rounded-3xl min-h-48 min-w-72">
          <div>
            {room.revealCards ? <StartVotingButton /> : <RevealCardsButton />}
          </div>
        </div>
        <div className="flex">
          {/*{rightSide.map((player) => (*/}
          {/*  <Card*/}
          {/*    key={player.userId}*/}
          {/*    state={room.revealCards ? 'reveal' : 'hide'}*/}
          {/*    playerName={player.displayName}*/}
          {/*    value={room.votes[player.userId]}*/}
          {/*  />*/}
          {/*))}*/}
        </div>
        <div></div>
        <div className="flex justify-around px-12 gap-x-12">
          {bottomSide.map((player) => (
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

      {user && <CardPicker />}
      <LoginDialog show={!user} />
    </div>
  );
}
