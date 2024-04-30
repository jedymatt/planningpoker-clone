import { get, onDisconnect, onValue, ref, set } from 'firebase/database';
import { rtdb } from './firebase';
import { joinRoom } from '@/lib/dbQueries';

export function listenToUserPresenceInRoom(
  roomId: string,
  userId: string,
  displayName: string | null,
) {
  const userPresenceRef = ref(rtdb, `rooms/${roomId}/users/${userId}`);
  const connectedRef = ref(rtdb, '.info/connected');

  return onValue(connectedRef, async (snap) => {
    if (snap.val() === true) {
      await set(userPresenceRef, true);
      await joinRoom({ id: userId, displayName }, roomId);
      await onDisconnect(userPresenceRef).remove();
    }
  });
}

/**
 * @param roomId
 * @returns IDs of the active users in the room
 */
export async function getActiveUsersInRoom(roomId: string) {
  const usersRef = ref(rtdb, `rooms/${roomId}/users`);
  const snapshot = await get(usersRef);

  return snapshot.val() !== null ? Object.keys(snapshot.val()) : [];
}
