import { useRoomContext } from '@/app/[room]/roomContext';
import { TextField } from '@/app/_ui/textField';
import { joinRoom, updateUser } from '@/lib/dbQueries';
import * as Dialog from '@radix-ui/react-dialog';
import { useUserContext } from '../userContext';

function DisplayNameForm() {
  const user = useUserContext()!;
  const onSubmit = async (e: FormData) => {
    await updateUser(user.id, {
      displayName: e.get('displayName') as string
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
        <Dialog.Overlay className="bg-cyan-950/50 fixed inset-0 z-[1]" />
        <Dialog.Content
          className="z-[2] fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border px-8 py-16">
          <DisplayNameForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
