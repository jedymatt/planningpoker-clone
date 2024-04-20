import {
  signInAnonymously,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Room, RoomCreated, RoomSchema, User, UserSchema } from './types';
import { z } from 'zod';

export async function saveRoom(room: Pick<Room, 'name' | 'cards'>) {
  const roomResult = RoomSchema.pick({ name: true, cards: true }).parse(room);
  const docRef = await addDoc(collection(db, 'rooms'), roomResult);

  return docRef.id;
}

export async function getRoomById(roomId: string): Promise<RoomCreated | null> {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = RoomSchema.parse(docSnap.data());

  return { ...data, id: docSnap.id };
}

export function onRoomChanged(
  roomId: string,
  callback: (room: RoomCreated) => void,
) {
  const docRef = doc(db, 'rooms', roomId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = RoomSchema.parse(docSnap.data());
      callback({ ...data, id: docSnap.id });
    }
  });
}

export function updateRoom(roomId: string, room: Partial<Room>) {
  const roomResult = RoomSchema.partial().parse(room);
  const docRef = doc(db, 'rooms', roomId);

  return updateDoc(docRef, roomResult);
}

export async function signInAnon(displayName?: string): Promise<User> {
  const { user } = await signInAnonymously(auth);
  await updateProfile(user, { displayName });

  return UserSchema.parse(user);
}

export async function joinRoom(user: FirebaseUser, roomId: string) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  const PlayerOnlySchema = RoomSchema.pick({ players: true });
  const { players } = PlayerOnlySchema.parse(docSnap.data());

  if (players.some((pl) => pl.userId === user.uid)) {
    return;
  }

  console.log(user.displayName);

  await updateDoc(docRef, <z.infer<typeof PlayerOnlySchema>>{
    players: [
      ...players,
      {
        userId: user.uid,
        displayName: user.displayName!,
      },
    ],
  });
}

export async function updatePlayerCard(
  roomId: string,
  playerId: string,
  card: string | null,
) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  await updateDoc(docRef, {
    [`votes.${playerId}`]: card,
  });
}

export async function revealCards(roomId: string) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  await updateDoc(docRef, {
    revealCards: true,
  });
}

export async function startVoting(roomId: string) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  await updateDoc(docRef, { votes: {}, revealCards: false });
}
