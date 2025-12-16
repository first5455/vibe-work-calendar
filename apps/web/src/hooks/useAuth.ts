import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string; } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
        try {
            // Use users.me to get fresh data from DB instead of stale JWT claims
            const { data, error } = await (api.users as any).me.get();
            if (data && !error) {
                setUser(data as any); 
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    checkSession();
  }, []);

  return { user, loading };
}
