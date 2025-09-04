import { supabase } from "./supabase";
import { FormData } from "../types/form";

export interface EligibilitySubmission {
  id: string;
  user_id: string;
  reference_id: string;
  personal_info: any;
  education_info: any;
  work_experience: any;
  language_skills: any;
  canadian_connections: any;
  additional_info: any;
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

// Convert database structure back to FormData
export const submissionDataToFormData = (
  submission: EligibilitySubmission
): FormData => {
  return {
    fullName: submission.personal_info?.fullName || "",
    email: submission.personal_info?.email || "",
    countryOfCitizenship: submission.personal_info?.countryOfCitizenship || "",
    countryOfResidence: submission.personal_info?.countryOfResidence || "",
    ageGroup: submission.personal_info?.ageGroup || "",
    maritalStatus: submission.personal_info?.maritalStatus || "",
    hasChildren: submission.personal_info?.hasChildren || "no",
    childrenAges: submission.personal_info?.childrenAges || "",
    highestEducation: submission.education_info?.highestEducation || "",
    educationOutsideCanada:
      submission.education_info?.educationOutsideCanada || "no",
    yearsOfExperience: submission.work_experience?.yearsOfExperience || "",
    workInRegulatedProfession:
      submission.work_experience?.workInRegulatedProfession || "not-sure",
    occupation: submission.work_experience?.occupation || "",
    speakEnglishOrFrench:
      submission.language_skills?.speakEnglishOrFrench || "no",
    languageTest: submission.language_skills?.languageTest || "no",
    languageLevel: submission.language_skills?.languageLevel || "",
    testScores: submission.language_skills?.testScores || "",
    interestedInImmigrating:
      submission.canadian_connections?.interestedInImmigrating || [],
    studiedOrWorkedInCanada:
      submission.canadian_connections?.studiedOrWorkedInCanada || "no",
    jobOfferFromCanadianEmployer:
      submission.canadian_connections?.jobOfferFromCanadianEmployer || "no",
    relativesInCanada:
      submission.canadian_connections?.relativesInCanada || "no",
    settlementFunds: submission.canadian_connections?.settlementFunds || "no",
    settlementFundsAmount:
      submission.canadian_connections?.settlementFundsAmount || "",
    businessOrManagerialExperience:
      submission.additional_info?.businessOrManagerialExperience || "no",
    additionalInfo: submission.additional_info?.additionalInfo || "",
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

      const { data, error } = await supabase
        .from("eligibility_submissions")
        .insert({
          user_id: userId,
          personal_info: submissionData.personal_info,
          education_info: submissionData.education_info,
          work_experience: submissionData.work_experience,
          language_skills: submissionData.language_skills,
          canadian_connections: submissionData.canadian_connections,
          additional_info: submissionData.additional_info,
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

    const { error } = await supabase
      .from("eligibility_submissions")
      .delete()
      .eq("reference_id", referenceId)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error deleting submission:", error);
      throw error;
    }

    console.log("✅ Deleted submission:", referenceId);
  } catch (error) {
    console.error("💥 Failed to delete submission:", error);
    throw error;
  }
};
