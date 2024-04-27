import { onUserChanged } from '@/lib/dbQueries';
import { User } from '@/lib/schemas';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const UserContext = createContext<User | null>(null);

export const useUserContext = () => useContext(UserContext);

export function UserProvider({
  initialValue,
  children,
}: PropsWithChildren<{ initialValue: User }>) {
  const [user, setUser] = useState<User | null>(initialValue);

  useEffect(() => {
    return onUserChanged(initialValue.id, (user) => {
      setUser(user);
    });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
