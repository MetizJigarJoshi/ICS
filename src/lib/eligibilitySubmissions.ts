import { supabase } from "./supabase";
import { FormData } from "../types/form";

// Generate a unique reference ID
const generateReferenceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `IEA-${timestamp}-${random}`.toUpperCase();
};

export interface EligibilitySubmission {
  id: string;
  user_id: string;
  reference_id: string;
  personal_info: any; // Can be object or JSON string
  education_info: any; // Can be object or JSON string
  work_experience: any; // Can be object or JSON string
  language_skills: any; // Can be object or JSON string
  canadian_connections: any; // Can be object or JSON string
  additional_info: any; // Can be object or JSON string
  submission_status: string;
  created_at: string;
  updated_at: string;
}

// Convert FormData to the database structure
export const formDataToSubmissionData = (formData: FormData) => {
  return {
    personal_info: {
      fullName: formData.fullName,
      email: formData.email,
      countryOfCitizenship: formData.countryOfCitizenship,
      countryOfResidence: formData.countryOfResidence,
      ageGroup: formData.ageGroup,
      maritalStatus: formData.maritalStatus,
      hasChildren: formData.hasChildren,
      childrenAges: formData.childrenAges,
    },
    education_info: {
      highestEducation: formData.highestEducation,
      educationOutsideCanada: formData.educationOutsideCanada,
    },
    work_experience: {
      yearsOfExperience: formData.yearsOfExperience,
      workInRegulatedProfession: formData.workInRegulatedProfession,
      occupation: formData.occupation,
    },
    language_skills: {
      speakEnglishOrFrench: formData.speakEnglishOrFrench,
      languageTest: formData.languageTest,
      languageLevel: formData.languageLevel,
      testScores: formData.testScores,
    },
    canadian_connections: {
      interestedInImmigrating: formData.interestedInImmigrating,
      studiedOrWorkedInCanada: formData.studiedOrWorkedInCanada,
      jobOfferFromCanadianEmployer: formData.jobOfferFromCanadianEmployer,
      relativesInCanada: formData.relativesInCanada,
      settlementFunds: formData.settlementFunds,
      settlementFundsAmount: formData.settlementFundsAmount,
    },
    additional_info: {
      businessOrManagerialExperience: formData.businessOrManagerialExperience,
      additionalInfo: formData.additionalInfo,
    },
  };
};

// Helper function to safely parse JSON strings
const safeParseJson = (data: any): any => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn("Failed to parse JSON string:", data);
      return {};
    }
  }
  return data || {};
};

// Convert database structure back to FormData
export const submissionDataToFormData = (
  submission: EligibilitySubmission
): FormData => {
  // Parse JSON strings if they exist
  const personalInfo = safeParseJson(submission.personal_info);
  const educationInfo = safeParseJson(submission.education_info);
  const workExperience = safeParseJson(submission.work_experience);
  const languageSkills = safeParseJson(submission.language_skills);
  const canadianConnections = safeParseJson(submission.canadian_connections);
  const additionalInfo = safeParseJson(submission.additional_info);

  console.log("🔄 Parsed submission data:", {
    personalInfo,
    educationInfo,
    workExperience,
    languageSkills,
    canadianConnections,
    additionalInfo,
  });

  return {
    fullName: personalInfo.fullName || "",
    email: personalInfo.email || "",
    countryOfCitizenship: personalInfo.countryOfCitizenship || "",
    countryOfResidence: personalInfo.countryOfResidence || "",
    ageGroup: personalInfo.ageGroup || "",
    maritalStatus: personalInfo.maritalStatus || "",
    hasChildren: personalInfo.hasChildren || "no",
    childrenAges: personalInfo.childrenAges || "",
    highestEducation: educationInfo.highestEducation || "",
    educationOutsideCanada: educationInfo.educationOutsideCanada || "no",
    yearsOfExperience: workExperience.yearsOfExperience || "",
    workInRegulatedProfession:
      workExperience.workInRegulatedProfession || "not-sure",
    occupation: workExperience.occupation || "",
    speakEnglishOrFrench: languageSkills.speakEnglishOrFrench || "no",
    languageTest: languageSkills.languageTest || "no",
    languageLevel: languageSkills.languageLevel || "",
    testScores: languageSkills.testScores || "",
    interestedInImmigrating: canadianConnections.interestedInImmigrating || [],
    studiedOrWorkedInCanada:
      canadianConnections.studiedOrWorkedInCanada || "no",
    jobOfferFromCanadianEmployer:
      canadianConnections.jobOfferFromCanadianEmployer || "no",
    relativesInCanada: canadianConnections.relativesInCanada || "no",
    settlementFunds: canadianConnections.settlementFunds || "no",
    settlementFundsAmount: canadianConnections.settlementFundsAmount || "",
    businessOrManagerialExperience:
      additionalInfo.businessOrManagerialExperience || "no",
    additionalInfo: additionalInfo.additionalInfo || "",
  };
};

// Fetch all submissions for a user
export const fetchUserSubmissions = async (
  userId: string
): Promise<EligibilitySubmission[]> => {
  try {
    console.log("🔄 Fetching submissions for user:", userId);

    const { data, error } = await supabase
      .from("eligibility_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching submissions:", error);
      throw error;
    }

    console.log("✅ Fetched submissions:", data?.length || 0);
    if (data && data.length > 0) {
      console.log("📊 Raw submission data sample:", data[0]);
    }
    return data || [];
  } catch (error) {
    console.error("💥 Failed to fetch submissions:", error);
    throw error;
  }
};

// Fetch the latest submission for a user
export const fetchLatestSubmission = async (
  userId: string
): Promise<EligibilitySubmission | null> => {
  try {
    console.log("🔄 Fetching latest submission for user:", userId);

    const { data, error } = await supabase
      .from("eligibility_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        console.log("📝 No submissions found for user");
        return null;
      }
      console.error("❌ Error fetching latest submission:", error);
      throw error;
    }

    console.log("✅ Fetched latest submission:", data?.reference_id);
    return data;
  } catch (error) {
    console.error("💥 Failed to fetch latest submission:", error);
    throw error;
  }
};

// Save or update a submission
export const saveSubmission = async (
  userId: string,
  formData: FormData,
  referenceId?: string
): Promise<EligibilitySubmission> => {
  try {
    console.log("💾 Saving submission for user:", userId);

    const submissionData = formDataToSubmissionData(formData);

    if (referenceId) {
      // Update existing submission
      console.log("🔄 Updating existing submission:", referenceId);

      const { data, error } = await supabase
        .from("eligibility_submissions")
        .update({
          personal_info: submissionData.personal_info,
          education_info: submissionData.education_info,
          work_experience: submissionData.work_experience,
          language_skills: submissionData.language_skills,
          canadian_connections: submissionData.canadian_connections,
          additional_info: submissionData.additional_info,
          updated_at: new Date().toISOString(),
        })
        .eq("reference_id", referenceId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating submission:", error);
        throw error;
      }

      console.log("✅ Updated submission:", data?.reference_id);
      return data;
    } else {
      // Create new submission
      console.log("🆕 Creating new submission");

      const referenceId = generateReferenceId();
      console.log("🆕 Generated reference ID:", referenceId);

      const { data, error } = await supabase
        .from("eligibility_submissions")
        .insert({
          user_id: userId,
          reference_id: referenceId,
          personal_info: submissionData.personal_info,
          education_info: submissionData.education_info,
          work_experience: submissionData.work_experience,
          language_skills: submissionData.language_skills,
          canadian_connections: submissionData.canadian_connections,
          additional_info: submissionData.additional_info,
          full_name: formData.fullName, // Extract for indexing
          email: formData.email, // Extract for indexing
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating submission:", error);
        throw error;
      }

      console.log("✅ Created new submission:", data?.reference_id);
      return data;
    }
  } catch (error) {
    console.error("💥 Failed to save submission:", error);
    throw error;
  }
};

// Delete a submission
export const deleteSubmission = async (
  userId: string,
  referenceId: string
): Promise<void> => {
  try {
    console.log("🗑️ Deleting submission:", referenceId);
    console.log("🗑️ User ID:", userId);
    console.log("🗑️ Reference ID:", referenceId);

    // First, let's check if the submission exists
    const { data: existingSubmission, error: fetchError } = await supabase
      .from("eligibility_submissions")
      .select("id, user_id, reference_id")
      .eq("reference_id", referenceId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching submission to delete:", fetchError);
      throw new Error(
        `Submission not found or access denied: ${fetchError.message}`
      );
    }

    console.log("🗑️ Found submission to delete:", existingSubmission);

    // Now delete the submission
    const { error } = await supabase
      .from("eligibility_submissions")
      .delete()
      .eq("reference_id", referenceId)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error deleting submission:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("✅ Deleted submission:", referenceId);
  } catch (error) {
    console.error("💥 Failed to delete submission:", error);
    throw error;
  }
};
