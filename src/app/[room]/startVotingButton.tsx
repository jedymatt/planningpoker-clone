import {useRoomContext} from '@/app/[room]/roomContext';
import {startVoting} from '@/lib/dbQueries';

export function StartVotingButton() {
    const room = useRoomContext()!;

    return (
        <button
            onClick={async () => {
                await startVoting(room.id);
            }}
            className="px-4 py-2 font-bold text-white rounded bg-slate-600 hover:bg-slate-800"
        >
            Start new voting
        </button>
    );
}