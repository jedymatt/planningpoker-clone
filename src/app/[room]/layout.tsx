'use client';

import 'next/dynamic';

import { RoomContextProvider, useRoomContext } from '@/app/[room]/room';
import { useAuthContext } from '@/app/auth';
import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode, useEffect, useState } from 'react';
import { LoadingRoomScreen } from '../_ui/LoadingRoomScreen';
import { TextField } from '../_ui/TextField';

function Navbar() {
  const room = useRoomContext();
  const user = useAuthContext();
  const [showInvite, setShowInvite] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLink(window.location.href);
    }
  }, []);

  const onCopyLink = async () => {
    if (!link) return;

    await navigator.clipboard.writeText(link);
    // todo: show toast
    console.log('copied');

    // close dialog
    setShowInvite(false);
  };

  return (
    <nav className="flex px-12 py-6">
      <div className="flex-grow">
        <span className="font-semibold text-xl">{room?.name}</span>
      </div>
      <div className="flex gap-4 items-center justify-start">
        {user && user.displayName && (
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?${Object.entries({
                name: user.displayName[0],
                color: '74b3ff',
                background: 'ebf4ff',
                bold: true,
              })
                .map(([key, value]) => `${key}=${value}`)
                .join('&')}`}
              className="rounded-full w-8 h-8"
              alt="Avatar"
            />
            <span className="ml-2 font-bold">{user.displayName}</span>
          </div>
        )}
        {link && (
          <Dialog.Root open={showInvite} onOpenChange={setShowInvite}>
            <Dialog.Trigger asChild>
              <button className="border-2 border-blue-500 px-3 py-2 rounded-md text-blue-500 bg-white hover:bg-blue-100 font-bold flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
                <span className="ml-2">Invite players</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-cyan-950/50 fixed inset-0" />
              <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border px-8 py-16">
                <Dialog.Title className="text-2xl font-bold">
                  Invite players
                </Dialog.Title>
                <div className="mt-12">
                  <TextField
                    type="text"
                    className="w-full rounded-md border"
                    label="Game's url"
                    value={link}
                    onChange={(e) => e.preventDefault()}
                  />

                  <button
                    className="mt-4 bg-blue-500 text-white px-3 py-2 rounded-md w-full"
                    onClick={onCopyLink}
                  >
                    Copy invitation link
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({
  params,
  children,
}: Readonly<{
  params: { room: string };
  children: ReactNode;
}>) {
  const user = useAuthContext();

  return (
    <RoomContextProvider roomId={params.room}>
      <div
        style={{ gridTemplateRows: 'auto 1fr' }}
        className="grid min-h-screen"
      >
        <Navbar />
        <main>{user ? children : <LoadingRoomScreen />}</main>
      </div>
    </RoomContextProvider>
  );
}
