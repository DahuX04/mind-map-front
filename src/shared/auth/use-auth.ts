"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig } from "@/src/shared/config/env";
import { supabase } from "./supabase";

type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    configured: hasSupabaseConfig,
    loading: hasSupabaseConfig,
    session: null,
    user: null,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({
        configured: true,
        loading: false,
        session: data.session,
        user: data.session?.user ?? null,
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        configured: true,
        loading: false,
        session,
        user: session?.user ?? null,
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      ...state,
      signOut: () => supabase?.auth.signOut(),
    }),
    [state],
  );
}
