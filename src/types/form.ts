export interface FormData {
  // Personal Information
  fullName: string
  email: string
  countryOfCitizenship: string
  countryOfResidence: string
  ageGroup: string
  maritalStatus: string
  hasChildren: 'yes' | 'no'
  childrenAges?: string

  // Education
  highestEducation: string
  educationOutsideCanada: 'yes' | 'no'

  // Work Experience
  yearsOfExperience: string
  workInRegulatedProfession: 'yes' | 'no' | 'not-sure'
  occupation: string

  // Language Skills
  speakEnglishOrFrench: 'yes' | 'no'
  languageTest: 'yes' | 'no'
  languageLevel?: string
  testScores?: string

  // Canadian Connections
  interestedInImmigrating: string
  studiedOrWorkedInCanada: 'yes' | 'no'
  jobOfferFromCanadianEmployer: 'yes' | 'no'
  relativesInCanada: 'yes' | 'no'
  settlementFunds: 'yes' | 'no'
  settlementFundsAmount?: string

  // Additional Information
  businessOrManagerialExperience: 'yes' | 'no'
  additionalInfo?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface EligibilitySubmission {
  id: string
  user_id: string
  reference_id: string
  personal_info: Record<string, any>
  education_info: Record<string, any>
  work_experience: Record<string, any>
  language_skills: Record<string, any>
  canadian_connections: Record<string, any>
  additional_info: Record<string, any>
  submission_status: string
  created_at: string
  updated_at: string
}