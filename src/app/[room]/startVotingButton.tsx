import { useRoomContext } from '@/app/[room]/roomContext';
import { startVoting } from '@/lib/dbQueries';

export function StartVotingButton() {
  const room = useRoomContext()!;

  return (
    <button
      onClick={async () => {
        await startVoting(room.id);
        // TODO: sync active users
        // TODO: Make sure it is the same behavior as the original
        // const activeUsers = await getActiveUsersInRoom(room.id);
        // const mappedUsers = await Promise.all(
        //   activeUsers.map((id) => getUserById(id)),
        // );

        // await setPlayersInRoom(
        //   room.id,
        //   mappedUsers
        //     .filter((u): u is User => u !== null)
        //     .filter((u) => u.displayName !== null)
        //     .map((u) => ({
        //       userId: u.id,
        //       displayName: u.displayName!,
        //     })),
        // );
      }}
      className="px-4 py-2 font-bold text-white rounded bg-slate-600 hover:bg-slate-800"
    >
      Start new voting
    </button>
  );
}
