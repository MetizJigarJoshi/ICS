import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, dbOperations, createUserProfile } from "../lib/supabase";
import { UserProfile } from "../types/form";
import { sendSignupWebhook } from "../lib/webhook";

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authState.loading) {
        console.warn("Auth loading timeout, forcing loading to false");
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authState.loading]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await dbOperations.getUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const profile = await dbOperations.getUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    formData?: any
  ) => {
    try {
      console.log("🚀 Starting signup process for:", email);
      console.log("🚀 Form data received:", formData);

      // First, create the auth user
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

      // If signup is successful and we have a user, create the profile
      if (data.user) {
        console.log("👤 User created, attempting to create profile...");
        try {
          console.log(
            "👤 Attempting to create user profile for:",
            data.user.id
          );

          // Wait a bit for the trigger to potentially work
          console.log("⏳ Waiting 1 second for trigger to work...");
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if profile was created by trigger
          console.log("🔍 Checking if profile was created by trigger...");
          let profile = await dbOperations.getUserProfile(data.user.id);
          console.log("🔍 Profile check result:", profile);

          if (!profile) {
            console.log(
              "⚠️ Profile not created by trigger, creating manually..."
            );

            // Use the dedicated function to create user profile
            const profileResult = await createUserProfile(
              data.user.id,
              email,
              fullName
            );

            if (!profileResult.success) {
              console.error("❌ Profile creation failed:", profileResult.error);
              // Don't throw here, as the user was created successfully
              // The profile can be created later via the trigger
            } else {
              console.log("✅ User profile created successfully");
              profile = profileResult.data;
            }
          } else {
            console.log("✅ Profile created by trigger successfully");
          }

          // Send webhook notification about new user creation
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
        } catch (profileErr) {
          console.error("💥 Profile creation failed:", profileErr);
          console.error("💥 Profile error details:", {
            name: profileErr instanceof Error ? profileErr.name : "Unknown",
            message:
              profileErr instanceof Error
                ? profileErr.message
                : String(profileErr),
            stack:
              profileErr instanceof Error ? profileErr.stack : "No stack trace",
          });
          // Continue with signup even if profile creation fails
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      throw new Error("No user logged in");
    }

    const success = await dbOperations.updateUserProfile(
      authState.user.id,
      updates
    );

    if (success) {
      // Refresh profile data
      const updatedProfile = await dbOperations.getUserProfile(
        authState.user.id
      );
      setAuthState((prev) => ({
        ...prev,
        profile: updatedProfile,
      }));
    }

    return success;
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
