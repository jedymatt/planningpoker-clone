import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from './firebase';
import { Room, RoomSchema, User, UserSchema } from './schemas';

export async function saveRoom(room: Pick<Room, 'name' | 'cards'>) {
  const roomResult = RoomSchema.pick({ name: true, cards: true }).parse(room);
  const docRef = await addDoc(collection(db, 'rooms'), roomResult);

  return docRef.id;
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return RoomSchema.parse({ ...docSnap.data(), id: docRef.id });
}

export function onRoomChanged(roomId: string, callback: (room: Room) => void) {
  const docRef = doc(db, 'rooms', roomId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = RoomSchema.parse({ ...docSnap.data(), id: docSnap.id });
      callback(data);
    }
  });
}

export function updateRoom(roomId: string, room: Partial<Omit<Room, 'id'>>) {
  const roomResult = RoomSchema.partial().parse(room);
  const docRef = doc(db, 'rooms', roomId);

  return updateDoc(docRef, roomResult);
}

export async function joinRoom(
  user: Pick<User, 'id' | 'displayName'>,
  roomId: string,
) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  const PlayerOnlySchema = RoomSchema.pick({ players: true });
  const { players } = PlayerOnlySchema.parse(docSnap.data());

  if (players.some((pl) => pl.userId === user.id)) {
    return;
  }

  await updateDoc(docRef, <z.infer<typeof PlayerOnlySchema>>{
    players: [
      ...players,
      {
        userId: user.id,
        displayName: user.displayName,
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

export async function getUserByUid(uid: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshots = await getDocs(q);

  if (snapshots.docs.length === 0) {
    return null;
  }

  const docSnap = snapshots.docs[0];

  return UserSchema.parse({ ...docSnap.data(), id: docSnap.id });
}

export async function getCurrentUser() {
  if (!auth.currentUser) return null;

  return await getUserByUid(auth.currentUser.uid);
}

export async function createUser(user: Omit<User, 'id'>) {
  const existingUser = await getUserByUid(user.uid);

  if (existingUser) {
    return null;
  }

  console.log(user);
  const docRef = await addDoc(collection(db, 'users'), user);

  return docRef.id;
}

/**
 * @param id Document id
 */
export function onUserChanged(id: string, callback: (user: User) => void) {
  return onSnapshot(doc(db, 'users', id), (docSnap) => {
    if (docSnap.exists()) {
      const user = UserSchema.parse({ ...docSnap.data(), id: docSnap.id });

      callback(user);
    }
  });
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>) {
  const docRef = doc(db, 'users', id);

  await updateDoc(docRef, data);
}
