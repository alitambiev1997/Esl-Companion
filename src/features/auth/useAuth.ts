import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  goal: string | null;
  current_level_id: string | null;
  onboarding_completed: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,full_name,goal,current_level_id,onboarding_completed')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      if (!mounted) return;

      setUser(sessionUser);
      if (sessionUser) {
        try {
          const loadedProfile = await loadProfile(sessionUser.id);
          if (!mounted) return;
          setProfile(loadedProfile);
        } catch {
          if (!mounted) return;
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
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

  return { user, profile, loading, signOut };
}