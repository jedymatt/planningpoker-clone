'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Room } from '@/lib/types';
import { onRoomChanged } from '@/lib/dbQueries';

const RoomContext = createContext<Room | null>(null);

export const useRoomContext = () => useContext(RoomContext);

export const RoomContextProvider = ({
  roomId,
  initialValue,
  children,
}: PropsWithChildren<{ roomId: string; initialValue?: Room }>) => {
  const [room, setRoom] = useState<Room | null>(initialValue ?? null);

  useEffect(() => {
    const unsubscribe = onRoomChanged(roomId, (user) => setRoom(user));
    return () => unsubscribe();
  }, []);

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
};
