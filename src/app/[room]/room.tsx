'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { RoomCreated } from '@/lib/types';
import { onRoomChanged } from '@/lib/dbQueries';

const RoomContext = createContext<RoomCreated | null>(null);

export const useRoomContext = () => useContext(RoomContext);

export const RoomContextProvider = ({
  roomId,
  children,
}: PropsWithChildren<{ roomId: string }>) => {
  const [room, setRoom] = useState<RoomCreated | null>(null);

  useEffect(() => {
    const unsubscribe = onRoomChanged(roomId, (user) => setRoom(user));
    return () => unsubscribe();
  }, []);

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
};
