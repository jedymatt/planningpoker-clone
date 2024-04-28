'use client';

import { onRoomChanged } from '@/lib/dbQueries';
import { Room } from '@/lib/schemas';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

const RoomContext = createContext<Room | null>(null);

export const useRoomContext = () => useContext(RoomContext);

export const RoomContextProvider = ({
  roomId,
  initialValue,
  children,
}: PropsWithChildren<{ roomId: string; initialValue?: Room }>) => {
  const [room, setRoom] = useState<Room | null>(initialValue ?? null);

  useEffect(() => {
    const unsubscribe = onRoomChanged(roomId, (room) => setRoom(room));
    return () => unsubscribe();
  }, []);

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
};
