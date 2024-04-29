import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = admin.initializeApp();

export const usersLeftFromRoom = functions.database
  .ref("/rooms/{roomId}/users/{userId}")
  .onDelete(async (_, context) => {
    const result = await admin
      .firestore(app)
      .doc(`/rooms/${context.params.roomId}`)
      .get();

    const room = result.data();
    if (!room) return;

    const players: {userId: string}[] = room.players ?? [];
    const votes: Record<string, string | null> = room.votes ?? {};

    const usersHavingVotes = Object.entries(votes)
      .filter(([, v]) => v !== null)
      .map(([k]) => k);

    if (usersHavingVotes.includes(context.params.userId)) {
      return;
    }

    await admin
      .firestore()
      .doc(`/rooms/${context.params.roomId}`)
      .update({
        players: players.filter((e) => e.userId !== context.params.userId),
      });
  });
