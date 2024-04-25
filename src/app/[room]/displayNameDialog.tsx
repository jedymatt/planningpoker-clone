import {useRoomContext} from '@/app/[room]/room';
import {updateProfile} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import {updateRoom} from '@/lib/dbQueries';
import {TextField} from '@/app/_ui/textField';
import * as Dialog from '@radix-ui/react-dialog';

function DisplayNameForm() {
    const room = useRoomContext()!;
    const onSubmit = async (e: FormData) => {
        await updateProfile(auth.currentUser!, {
            displayName: e.get('displayName') as string,
        });
        await updateRoom(room.id, {
            ...room,
            players: [
                ...room.players.filter((pl) => pl.userId !== auth.currentUser!.uid),
                {
                    userId: auth.currentUser!.uid,
                    displayName: auth.currentUser!.displayName!,
                },
            ],
        });
    };

    return (
        <form action={onSubmit}>
            <div className="font-bold text-slate-900 text-2xl">
                Choose your display name
            </div>
            <div className="mt-6">
                <TextField
                    type="text"
                    name="displayName"
                    label="Your display name"
                    className="mt-1 w-full border border-slate-200 rounded-md"
                    required
                />
            </div>
            <div className="mt-6">
                <button className="w-full bg-blue-500 text-white px-3 py-2 rounded-md font-bold disabled:bg-gray-300">
                    Continue to game
                </button>
            </div>
        </form>
    );
}

export function DisplayNameDialog() {
    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-cyan-950/50 fixed inset-0"/>
                <Dialog.Content
                    className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border px-8 py-16">
                    <DisplayNameForm/>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}