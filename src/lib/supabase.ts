import { createClient } from "@supabase/supabase-js";
import { UserProfile, EligibilitySubmission } from "../types/form";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to manually create user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string
) => {
  try {
    console.log("Attempting to create user profile:", {
      userId,
      email,
      fullName,
    });

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      console.log("User profile already exists");
      return { success: true, data: existingProfile };
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing profile:", checkError);
      return { success: false, error: checkError };
    }

    // Create the profile with better error handling
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);

      // If it's a foreign key constraint error, the user might not exist in auth.users
      if (error.code === "23503") {
        console.error(
          "Foreign key constraint failed - user might not exist in auth.users"
        );
      }

      return { success: false, error };
    }

    console.log("User profile created successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Exception creating user profile:", err);
    return { success: false, error: err };
  }
};

// Helper functions for database operations
export const dbOperations = {
  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);

        // If profile doesn't exist, try to create it
        if (error.code === "PGRST116") {
          console.log("User profile not found, attempting to create one...");

          // Get user info from auth
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
            console.error("Cannot get auth user:", authError);
            return null;
          }

          // Create profile
          const profileResult = await createUserProfile(
            userId,
            user.email || "",
            user.user_metadata?.full_name || ""
          );

          if (profileResult.success) {
            return profileResult.data;
          } else {
            console.error(
              "Failed to create user profile:",
              profileResult.error
            );
            // Return null instead of getting stuck
            return null;
          }
        }

        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception in getUserProfile:", err);
      return null;
    }
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId);

      if (error) {
        console.error("Error updating user profile:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception in updateUserProfile:", err);
      return false;
    }
  },

  // Eligibility Submission operations
  async createSubmission(
    submission: Omit<
      EligibilitySubmission,
      "id" | "reference_id" | "created_at" | "updated_at"
    >
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("eligibility_submissions")
        .insert(submission)
        .select("reference_id")
        .single();

      if (error) {
        console.error("Error creating submission:", error);
        return null;
      }

      return data.reference_id;
    } catch (err) {
      console.error("Exception in createSubmission:", err);
      return null;
    }
  },

  async getUserSubmissions(userId: string): Promise<EligibilitySubmission[]> {
    try {
      const { data, error } = await supabase
        .from("eligibility_submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception in getUserSubmissions:", err);
      return [];
    }
  },

  async getSubmissionByReference(
    referenceId: string
  ): Promise<EligibilitySubmission | null> {
    try {
      const { data, error } = await supabase
        .from("eligibility_submissions")
        .select("*")
        .eq("reference_id", referenceId)
        .single();

      if (error) {
        console.error("Error fetching submission by reference:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception in getSubmissionByReference:", err);
      return null;
    }
  },
};
