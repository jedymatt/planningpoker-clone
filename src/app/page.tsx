import { saveRoom } from '@/lib/dbQueries';
import { redirect } from 'next/navigation';
import { TextField } from './_ui/textField';

export default function Home() {
  const onSubmit = async (formData: FormData) => {
    'use server';

    const name = formData.get('name') as string;
    const votingSystem = formData.get('votingSystem') as string;

    const roomId = await saveRoom({
      name,
      cards: votingSystem.split(',').map((card) => card.trim()),
    });

    redirect(`/${roomId}`);
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <form action={onSubmit}>
          <h1 className="text-2xl font-bold text-center">Create a room</h1>
          <div className="mt-4">
            <TextField
              name="name"
              type="text"
              label="Room name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <select
              name="votingSystem"
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="1,2,3,5,8,?">Fibonacci (1, 2, 3, 5, 8, ?)</option>
            </select>
          </div>

          <div className="mt-4">
            <button className="w-full p-2 text-white bg-blue-500 rounded-md disabled:bg-gray-300">
              Create room
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
