'use client';

import { createUser, getCurrentUser } from '@/lib/dbQueries';
import { auth } from '@/lib/firebase';
import { User } from '@/lib/schemas';
import { PropsWithChildren, useEffect, useState } from 'react';
import { UserProvider } from './userContext';
import { useAuthContext } from './auth';
import { pick } from 'lodash';

export function UserWrapper({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const authUser = useAuthContext();

  useEffect(() => {
    const initUser = async () => {
      if (!authUser) return;

      const user = await getCurrentUser();
      if (user) {
        setUser(user);
        return;
      }

      if (user === null) {
        const userData = pick(authUser, 'uid', 'displayName', 'isAnonymous');
        const userId = await createUser(userData);

        if (userId) {
          setUser({ ...userData, id: userId });
        }
      }
    };

    initUser();
  }, [authUser]);

  if (!user) {
    return children;
  }

  return <UserProvider initialValue={user}>{children}</UserProvider>;
}
