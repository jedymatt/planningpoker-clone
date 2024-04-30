import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from './firebase';
import { Room, RoomSchema, User, UserSchema } from './schemas';
import { clone } from 'lodash';

export async function saveRoom(room: Pick<Room, 'name' | 'cards' | 'ownerId'>) {
  const roomResult = RoomSchema.pick({
    name: true,
    cards: true,
    ownerId: true
  }).parse(room);
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

export async function joinRoom(
  user: Pick<User, 'id' | 'displayName'>,
  roomId: string
) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }
  const PlayerOnlySchema = RoomSchema.pick({ players: true });
  const { players } = PlayerOnlySchema.parse(docSnap.data());
  const playerIndex = players.findIndex((player) => player.userId === user.id);

  if (playerIndex !== -1 && players[playerIndex].displayName === user.displayName) {
    return;
  }

  if (playerIndex === -1) {
    players.push({ userId: user.id, displayName: user.displayName });
  } else {
    players[playerIndex].displayName = user.displayName;
  }


  await updateDoc(docRef, <z.infer<typeof PlayerOnlySchema>>{
    players
  });


}

export async function kickPlayerFromRoom(userId: string, roomId: string) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  const PlayerOnlySchema = RoomSchema.pick({ players: true, votes: true });
  const { players, votes } = PlayerOnlySchema.parse(docSnap.data());

  const newPlayers = players.filter((pl) => pl.userId !== userId);

  const newVotes = Object.fromEntries(
    Object.entries(votes).filter(([key]) => key !== userId)
  );

  await updateDoc(docRef, <z.infer<typeof PlayerOnlySchema>>{
    players: newPlayers,
    votes: newVotes
  });
}

export async function updatePlayerCard(
  roomId: string,
  playerId: string,
  card: string | null
) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  await updateDoc(docRef, {
    [`votes.${playerId}`]: card
  });
}

export async function revealCards(roomId: string) {
  const docRef = doc(db, 'rooms', roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  await updateDoc(docRef, {
    revealCards: true
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

// export async function getUserById(id: string): Promise<User | null> {
//   const docRef = doc(db, 'users', id);
//   const docSnap = await getDoc(docRef);

//   if (!docSnap.exists()) {
//     return null;
//   }

//   return UserSchema.parse({ ...docSnap.data(), id: docSnap.id });
// }

export async function getCurrentUser() {
  if (!auth.currentUser) return null;

  return await getUserByUid(auth.currentUser.uid);
}

export async function createUser(user: Omit<User, 'id'>) {
  const existingUser = await getUserByUid(user.uid);

  if (existingUser) {
    return null;
  }

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

// export async function getUsersFromRoom(roomId: string): Promise<User[]> {
//   const docRef = doc(db, 'rooms', roomId);
//   const docSnap = await getDoc(docRef);

//   if (!docSnap.exists()) {
//     return [];
//   }

//   const PlayerOnlySchema = RoomSchema.pick({ players: true });
//   const { players } = PlayerOnlySchema.parse(docSnap.data());

//   const users = await Promise.all(
//     players
//       .map((e) => e.userId)
//       .map(async (id) => {
//         const snap = await getDoc(doc(db, 'users', id));

//         if (snap.exists()) {
//           return UserSchema.parse({ ...snap.data(), id: snap.id });
//         }
//         return null;
//       }),
//   );

//   return users.filter((u): u is User => u !== null);
// }

export async function setPlayersInRoom(roomId: string, players: Room['players']) {
  const docRef = doc(db, 'rooms', roomId);

  await updateDoc(docRef, { players });
}
