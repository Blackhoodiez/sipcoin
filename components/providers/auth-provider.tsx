"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 12; // Increased retries for better reliability

    const checkSession = async () => {
      if (!mounted) return;

      try {
        console.log(
          `🔧 AuthProvider: Checking session (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("AuthProvider: Error getting session:", error);
        } else {
          console.log(
            "🔧 AuthProvider: Session loaded:",
            session?.user?.email ?? "none"
          );

          if (session?.user && mounted) {
            console.log("✅ AuthProvider: User found, setting session");
            setSession(session);
            setUser(session.user);
            setLoading(false);
            return; // Success, stop retrying
          }
        }

        // If no session and haven't exceeded retries, try again
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          const delay = 500 + retryCount * 300; // Shorter initial delay, progressive increase
          console.log(
            `⏳ AuthProvider: No session, retrying in ${delay}ms... (${retryCount}/${maxRetries})`
          );
          setTimeout(checkSession, delay);
        } else if (mounted) {
          console.log(
            "🔧 AuthProvider: No session after retries, setting loading to false"
          );
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("AuthProvider: Unexpected error:", err);
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          const delay = 500 + retryCount * 300;
          setTimeout(checkSession, delay);
        } else if (mounted) {
          setLoading(false);
        }
      }
    };

    // Start checking session
    checkSession();

    // Also try to refresh the session immediately in case it exists but isn't detected
    const refreshSession = async () => {
      try {
        console.log("🔄 AuthProvider: Attempting to refresh session...");
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.log("AuthProvider: No existing session to refresh");
        } else if (data.session) {
          console.log("✅ AuthProvider: Session refreshed successfully");
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
        }
      } catch (err) {
        console.log(
          "AuthProvider: Session refresh failed (expected if no session)"
        );
      }
    };

    // Add a small delay before refreshing to allow cookies to be set
    setTimeout(refreshSession, 100);

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        console.log(
          "🔧 AuthProvider: Auth state changed:",
          _event,
          session?.user?.email ?? "none"
        );

        // If we get a session from auth state change, stop retrying
        if (session?.user) {
          console.log(
            "✅ AuthProvider: Session detected from auth state change"
          );
          setSession(session);
          setUser(session.user);
          setLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Logged in successfully!");
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Signup] Called for email:", email);

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) {
        console.error("[Signup] Error creating auth account:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("No user data returned from signup");
      }

      console.log("[Signup] Auth account created for user:", authData.user.id);

      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
    } catch (error: any) {
      console.error("[Signup] error:", error);
      const errorMessage = error.message || "Failed to create account";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Signout error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        login,
        signup,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
