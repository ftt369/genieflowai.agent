import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { UUID } from '../types/common';

export interface User {
  id: UUID;
  email: string;
  name?: string;
  image?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id as UUID,
        email: session.user.email as string,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [session, status]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
} 