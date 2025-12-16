import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string; } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
        try {
            const { data, error } = await api.auth.me.get();
            if (data && !error) {
                // Fetch full user details if needed, for now just what's in JWT or /me
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
