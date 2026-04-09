"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

interface AuthContextValue {
  readonly user: User | null;
  readonly session: Session | null;
  readonly role: UserRole | null;
  readonly isLoading: boolean;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

async function fetchUserRole(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userRole = await fetchUserRole(currentSession.user.id, supabase);
        if (mounted) {
          setRole(userRole);
        }
      }

      setIsLoading(false);
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userRole = await fetchUserRole(newSession.user.id, supabase);
        if (mounted) {
          setRole(userRole);
        }
      } else {
        setRole(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, [supabase]);

  const value: AuthContextValue = {
    user,
    session,
    role,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
