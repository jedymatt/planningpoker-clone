'use client';

import { saveRoom } from '@/lib/dbQueries';
import { TextField } from './_ui/textField';
import { useUserContext } from '@/app/userContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const CreateRoomFormSchema = z.object({
  name: z.string().min(1),
  votingSystem: z.string().min(1),
});

type CreateRoomForm = z.infer<typeof CreateRoomFormSchema>;

export default function Home() {
  const user = useUserContext();
  const {
    handleSubmit, //
    formState,
    register,
  } = useForm<CreateRoomForm>({
    defaultValues: { votingSystem: '1,2,3,5,8,?' },
  });
  const router = useRouter();

  if (!user) return null;

  const onSubmit = async (data: CreateRoomForm) => {
    const roomId = await saveRoom({
      name: data.name,
      cards: data.votingSystem.split(',').map((card) => card.trim()),
      ownerId: user.id,
    });

    return router.push(`/${roomId}`);
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-2xl font-bold text-center">Create a room</h1>
          <div className="mt-4">
            <TextField
              {...register('name', { required: true, minLength: 1 })}
              type="text"
              label="Room name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <select
              {...register('votingSystem', { required: true })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="1,2,3,5,8,?">Fibonacci (1, 2, 3, 5, 8, ?)</option>
            </select>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="w-full p-2 text-white bg-blue-500 rounded-md disabled:bg-gray-300"
              disabled={formState.isSubmitting}
            >
              Create room
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
