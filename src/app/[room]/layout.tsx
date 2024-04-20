'use client';

import { RoomContextProvider, useRoomContext } from '@/app/[room]/room';
import { useAuthContext } from '@/app/auth';
import { ReactNode } from 'react';

function Navbar() {
  const room = useRoomContext();
  const user = useAuthContext();

  return (
    <nav className="absolute top-0 inset-x-0 flex p-6">
      <div className="flex-grow">
        <span>{room?.name}</span>
      </div>
      <div className="flex gap-4 items-center">
        {user && (
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
        <button
          // onClick={() => setShowingInviteModal(true)}
          className="border-2 border-blue-400 px-3 py-2 rounded-md text-blue-400 bg-white hover:bg-blue-100 font-bold flex"
        >
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
  return (
    <RoomContextProvider roomId={params.room}>
      <div className="flex">
        <Navbar />
        <main className="flex-grow">{children}</main>
      </div>
    </RoomContextProvider>
  );
}
