import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { sendSignupWebhook } from "../lib/webhook";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // Ensure a user profile exists in public.user_profiles for the given auth user
  const ensureUserProfile = async (user: User) => {
    try {
      const userId = user.id;
      const email = user.email || "";
      const fullName = (user.user_metadata as any)?.full_name || "";

      // Check if profile exists
      const { data: existing, error: fetchError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) {
        console.warn("⚠️ Failed to check existing user profile:", fetchError);
      }

      if (!existing) {
        // Create profile
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({ id: userId, email, full_name: fullName });

        if (insertError) {
          console.error("❌ Failed to create user profile:", insertError);
        } else {
          console.log("✅ Created user profile for:", email);
        }
      } else {
        // Optionally keep email/full_name in sync
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ email, full_name: fullName })
          .eq("id", userId);
        if (updateError) {
          console.warn("⚠️ Failed to sync user profile fields:", updateError);
        }
      }
    } catch (profileError) {
      console.error("💥 ensureUserProfile error:", profileError);
    }
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authState.loading) {
        console.warn("⚠️ Auth loading timeout (10s), forcing loading to false");
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authState.loading]);

  useEffect(() => {
    console.log("🚀 Initializing useAuth hook...");

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("🔄 Getting initial session...");

        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Session fetch timeout")), 5000);
        });

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (session?.user) {
          console.log("👤 User session found");
          setAuthState({
            user: session.user,
            session,
            loading: false,
          });
        } else {
          console.log("❌ No user session found");
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("❌ Error getting initial session:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Add fallback timeout to ensure loading is never stuck
    const fallbackTimeout = setTimeout(() => {
      setAuthState((prev) => {
        if (prev.loading) {
          console.warn("🚨 Fallback timeout: forcing loading to false");
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 8000);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("🔄 Auth state change event:", event);

        if (session?.user) {
          console.log("👤 Auth state change: user found");
          // Best-effort ensure profile exists
          ensureUserProfile(session.user);
          setAuthState({
            user: session.user,
            session,
            loading: false,
          });
        } else {
          console.log("❌ Auth state change: no user");
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("❌ Error in auth state change:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    return () => {
      console.log("🧹 Cleaning up useAuth hook...");
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []); // Empty dependency array - run once on mount

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    formData?: any
  ) => {
    try {
      console.log("🚀 Starting signup process for:", email);
      console.log("🚀 Form data received:", formData);

      // Create the auth user
      console.log("🔐 Calling Supabase auth.signUp...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("❌ Supabase auth signup error:", error);
        throw error;
      }

      console.log("✅ Auth signup successful:", data);
      console.log("✅ User object:", data.user);
      console.log("✅ Session object:", data.session);

      // If signup is successful and we have a user, ensure profile + send webhook
      if (data.user) {
        // Ensure user profile exists immediately after signup
        await ensureUserProfile(data.user);
        console.log("👤 User created, sending webhook...");
        try {
          console.log("🔔 About to send signup webhook...");
          console.log("🔔 User ID:", data.user.id);
          console.log("🔔 Email:", email);
          console.log("🔔 Full Name:", fullName);
          console.log("🔔 Form Data:", formData);

          const webhookResult = await sendSignupWebhook(
            data.user.id,
            email,
            fullName,
            formData
          );

          if (webhookResult) {
            console.log("✅ User creation webhook sent successfully");
          } else {
            console.error("❌ User creation webhook failed (returned false)");
          }
        } catch (webhookError) {
          console.error(
            "💥 Failed to send user creation webhook:",
            webhookError
          );
          // Don't fail the signup if webhook fails
        }
      }

      console.log("🎉 Signup process completed successfully, returning data");
      return data;
    } catch (error) {
      console.error("💥 Signup error:", error);
      console.error("💥 Signup error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    console.log("🚪 Starting sign out process...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Supabase sign out error:", error);
      throw error;
    }
    console.log(
      "✅ Supabase sign out successful - auth state change will handle redirect"
    );
    // Don't manually reset auth state - let the auth state change listener handle it
    // The onAuthStateChange listener will automatically set user to null and loading to false
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
}
