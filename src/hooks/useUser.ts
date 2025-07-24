'use client';

import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/provider/SupabaseProvider';

export function useUser() {
  const { user, isLoading } = useSupabase();
  
  return { 
    user, 
    loading: isLoading 
  };
}
