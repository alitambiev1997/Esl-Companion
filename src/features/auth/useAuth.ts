import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signOut };
}
