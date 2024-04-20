import { getRoomById } from '@/lib/dbQueries';
import { notFound } from 'next/navigation';
import MainPage from './main';

export default async function Session({
  params,
}: {
  params: { room: string };
}) {
  const room = await getRoomById(params.room);

  if (!room) {
    notFound();
  }

  return <MainPage />;
}
