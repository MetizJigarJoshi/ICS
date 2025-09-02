import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, AlertCircle, User, GraduationCap, Briefcase, Globe, Users, FileText } from 'lucide-react'
import { FormData } from '../types/form'
import { useAuth } from '../hooks/useAuth'
import { dbOperations } from '../lib/supabase'

interface EligibilityFormProps {
  onSubmissionSuccess: (referenceId: string) => void
  onAuthRequired: (formData: FormData) => void
}

export function EligibilityForm({ onSubmissionSuccess, onAuthRequired }: EligibilityFormProps) {
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (!user) {
        // User not logged in - trigger auth flow
        onAuthRequired(data)
        return
      }

      // User is logged in - save submission directly
      const referenceId = await dbOperations.createSubmission({
        user_id: user.id,
        personal_info: {
          fullName: data.fullName,
          email: data.email,
          countryOfCitizenship: data.countryOfCitizenship,
          countryOfResidence: data.countryOfResidence,
          ageGroup: data.ageGroup,
          maritalStatus: data.maritalStatus,
          hasChildren: data.hasChildren,
          childrenAges: data.childrenAges
        },
        education_info: {
          highestEducation: data.highestEducation,
          educationOutsideCanada: data.educationOutsideCanada
        },
        work_experience: {
          yearsOfExperience: data.yearsOfExperience,
          workInRegulatedProfession: data.workInRegulatedProfession,
          occupation: data.occupation
        },
        language_skills: {
          speakEnglishOrFrench: data.speakEnglishOrFrench,
          languageTest: data.languageTest,
          testScores: data.testScores
        },
        canadian_connections: {
          interestedInImmigrating: data.interestedInImmigrating,
          studiedOrWorkedInCanada: data.studiedOrWorkedInCanada,
          jobOfferFromCanadianEmployer: data.jobOfferFromCanadianEmployer,
          relativesInCanada: data.relativesInCanada,
          settlementFunds: data.settlementFunds
        },
        additional_info: {
          businessOrManagerialExperience: data.businessOrManagerialExperience,
          additionalInfo: data.additionalInfo
        },
        submission_status: 'submitted'
      })

      if (referenceId) {
        onSubmissionSuccess(referenceId)
      } else {
        setSubmitError('Failed to submit form. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError('An error occurred while submitting the form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">Immigration Eligibility Assessment</h1>
          <p className="text-red-100">
            Complete this form to request a personalized evaluation of your immigration options.
            Assessments are completed by licensed Canadian immigration consultants.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Personal Information */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your email address? *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of citizenship *
                </label>
                <select
                  {...register('countryOfCitizenship', { required: 'Country of citizenship is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="China">China</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Other">Other</option>
                </select>
                {errors.countryOfCitizenship && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.countryOfCitizenship.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Residence *
                </label>
                <select
                  {...register('countryOfResidence', { required: 'Country of residence is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="China">China</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Other">Other</option>
                </select>
                {errors.countryOfResidence && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.countryOfResidence.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group *
              </label>
              <div className="space-y-2">
                {['Under 18', '18-29', '30-35', '36-40', '41-45', '46-55', 'Over 55'].map((age) => (
                  <label key={age} className="flex items-center">
                    <input
                      type="radio"
                      value={age}
                      {...register('ageGroup', { required: 'Age group is required' })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{age}</span>
                  </label>
                ))}
              </div>
              {errors.ageGroup && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.ageGroup.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status *
              </label>
              <div className="space-y-2">
                {['Single', 'Married', 'Common-law', 'Separated', 'Divorced', 'Widowed'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      value={status}
                      {...register('maritalStatus', { required: 'Marital status is required' })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
              {errors.maritalStatus && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.maritalStatus.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have children? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('hasChildren', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('hasChildren', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.hasChildren && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.hasChildren.message}
                </p>
              )}
            </div>

            {watch('hasChildren') === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If yes, how many and what ages?
                </label>
                <textarea
                  {...register('childrenAges')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., 2 children - ages 8 and 12"
                />
              </div>
            )}
          </section>

          {/* Education */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Education</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your highest education level? *
              </label>
              <div className="space-y-2">
                {[
                  'High School',
                  'College Diploma',
                  "Bachelor's Degree",
                  "Master's Degree",
                  'PhD or higher',
                  'Trade Certificate',
                  'No formal education'
                ].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      value={level}
                      {...register('highestEducation', { required: 'Education level is required' })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
              {errors.highestEducation && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.highestEducation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was your education completed outside of Canada? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('educationOutsideCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('educationOutsideCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.educationOutsideCanada && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.educationOutsideCanada.message}
                </p>
              )}
            </div>
          </section>

          {/* Work Experience */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Work Experience</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many years of full time, skilled work experience do you have? *
              </label>
              <div className="space-y-2">
                {[
                  'Less than 1 year',
                  '1-2 years',
                  '2-3 years',
                  '3-5 years',
                  'Over 5 years'
                ].map((years) => (
                  <label key={years} className="flex items-center">
                    <input
                      type="radio"
                      value={years}
                      {...register('yearsOfExperience', { required: 'Work experience is required' })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{years}</span>
                  </label>
                ))}
              </div>
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.yearsOfExperience.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is your work experience in a regulated profession? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('workInRegulatedProfession', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('workInRegulatedProfession', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="not-sure"
                    {...register('workInRegulatedProfession', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Not Sure</span>
                </label>
              </div>
              {errors.workInRegulatedProfession && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.workInRegulatedProfession.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your occupation title? *
              </label>
              <input
                type="text"
                {...register('occupation', { required: 'Occupation is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Software Engineer, Teacher, Accountant"
              />
              {errors.occupation && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.occupation.message}
                </p>
              )}
            </div>
          </section>

          {/* Language Skills */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Language Skills</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you speak English or French? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('speakEnglishOrFrench', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('speakEnglishOrFrench', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.speakEnglishOrFrench && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.speakEnglishOrFrench.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you taken an official language test (IELTS, CELPIP, TEF, etc.)? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('languageTest', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('languageTest', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.languageTest && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.languageTest.message}
                </p>
              )}
            </div>

            {watch('languageTest') === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please enter your test scores
                </label>
                <textarea
                  {...register('testScores')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., IELTS: L-8.0, R-7.5, W-7.0, S-8.5 or CELPIP: L-9, R-8, W-7, S-9"
                />
              </div>
            )}
          </section>

          {/* Canadian Connections */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Canadian Connections</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you interested in immigrating to Canada? *
              </label>
              <div className="space-y-2">
                {[
                  'Permanent Residency (Express Entry or PNP)',
                  'Work Permit',
                  'Study Permit',
                  'Business/Investment Program',
                  'Refugee/Asylum',
                  'I\'m not sure'
                ].map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      value={reason}
                      {...register('interestedInImmigrating', { required: 'Please select an option' })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              {errors.interestedInImmigrating && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.interestedInImmigrating.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you or your spouse previously studied or worked in Canada? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('studiedOrWorkedInCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('studiedOrWorkedInCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.studiedOrWorkedInCanada && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.studiedOrWorkedInCanada.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you currently have a job offer from a Canadian employer? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('jobOfferFromCanadianEmployer', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('jobOfferFromCanadianEmployer', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.jobOfferFromCanadianEmployer && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.jobOfferFromCanadianEmployer.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any relatives in Canada? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('relativesInCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('relativesInCanada', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.relativesInCanada && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.relativesInCanada.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any settlement funds available? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('settlementFunds', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('settlementFunds', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.settlementFunds && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.settlementFunds.message}
                </p>
              )}
            </div>
          </section>

          {/* Additional Information */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Additional Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you or your spouse have a business or have managerial experience? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    {...register('businessOrManagerialExperience', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="no"
                    {...register('businessOrManagerialExperience', { required: 'Please select an option' })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.businessOrManagerialExperience && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.businessOrManagerialExperience.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional information or special circumstances (optional)
              </label>
              <textarea
                {...register('additionalInfo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Please provide any additional information that might be relevant to your immigration assessment..."
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                After submitting this form, you will receive an email with the next steps.
                <strong> The report is prepared manually by a licensed Canadian immigration consultant.</strong>
              </p>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {submitError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Assessment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Assessment Request
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}