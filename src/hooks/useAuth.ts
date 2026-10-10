import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

/** Tracks the current Supabase session and clears user-specific UI state on sign-out. */
export function useAuth(onSignedOut: () => void) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(
      ({ data }) => {
        if (!active) return;
        setSession(data.session);
        setAuthLoading(false);
      },
      () => {
        if (active) setAuthLoading(false);
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthLoading(false);
      if (!nextSession) onSignedOut();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [onSignedOut]);

  return { session, authLoading };
}
