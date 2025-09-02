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
  testScores?: string

  // Canadian Connections
  interestedInImmigrating: string
  studiedOrWorkedInCanada: 'yes' | 'no'
  jobOfferFromCanadianEmployer: 'yes' | 'no'
  relativesInCanada: 'yes' | 'no'
  settlementFunds: 'yes' | 'no'

  // Additional Information
  businessOrManagerialExperience: 'yes' | 'no'
  additionalInfo?: string
}