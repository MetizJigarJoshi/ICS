import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  FileText,
  Save,
  Send,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { FormData } from '../types/form'
import { useAuth } from '../hooks/useAuth'
import { dbOperations } from '../lib/supabase'
import { sendEligibilityFormWebhook } from '../lib/webhook'
import { EligibilityForm } from './EligibilityForm'

interface DashboardProps {
  onSubmissionSuccess: (referenceId: string) => void
}

export function Dashboard({ onSubmissionSuccess }: DashboardProps) {
  const { user, profile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [previousSubmissions, setPreviousSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>()

  // Load user's previous submissions and populate form if available
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        setLoadingSubmissions(true)
        const submissions = await dbOperations.getUserSubmissions(user.id)
        setPreviousSubmissions(submissions)

        // If user has a previous submission, populate the form with the latest one
        if (submissions.length > 0) {
          const latestSubmission = submissions[0]
          const formData = {
            fullName: latestSubmission.personal_info?.fullName || profile?.full_name || '',
            email: latestSubmission.personal_info?.email || user.email || '',
            countryOfCitizenship: latestSubmission.personal_info?.countryOfCitizenship || '',
            countryOfResidence: latestSubmission.personal_info?.countryOfResidence || '',
            ageGroup: latestSubmission.personal_info?.ageGroup || '',
            maritalStatus: latestSubmission.personal_info?.maritalStatus || '',
            hasChildren: latestSubmission.personal_info?.hasChildren || '',
            childrenAges: latestSubmission.personal_info?.childrenAges || '',
            highestEducation: latestSubmission.education_info?.highestEducation || '',
            educationOutsideCanada: latestSubmission.education_info?.educationOutsideCanada || '',
            yearsOfExperience: latestSubmission.work_experience?.yearsOfExperience || '',
            workInRegulatedProfession: latestSubmission.work_experience?.workInRegulatedProfession || '',
            occupation: latestSubmission.work_experience?.occupation || '',
            speakEnglishOrFrench: latestSubmission.language_skills?.speakEnglishOrFrench || '',
            languageTest: latestSubmission.language_skills?.languageTest || '',
            testScores: latestSubmission.language_skills?.testScores || '',
            interestedInImmigrating: latestSubmission.canadian_connections?.interestedInImmigrating || '',
            studiedOrWorkedInCanada: latestSubmission.canadian_connections?.studiedOrWorkedInCanada || '',
            jobOfferFromCanadianEmployer: latestSubmission.canadian_connections?.jobOfferFromCanadianEmployer || '',
            relativesInCanada: latestSubmission.canadian_connections?.relativesInCanada || '',
            settlementFunds: latestSubmission.canadian_connections?.settlementFunds || '',
            businessOrManagerialExperience: latestSubmission.additional_info?.businessOrManagerialExperience || '',
            additionalInfo: latestSubmission.additional_info?.additionalInfo || '',
          }

          // Populate form with previous data
          Object.entries(formData).forEach(([key, value]) => {
            if (value) {
              setValue(key as keyof FormData, value)
            }
          })
        } else {
          // No previous submissions, populate with basic user info
          setValue('fullName', profile?.full_name || '')
          setValue('email', user.email || '')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoadingSubmissions(false)
      }
    }

    loadUserData()
  }, [user, profile, setValue])

  const onSaveDraft = async (data: FormData) => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Save as draft (you could add a draft status to your database)
      await dbOperations.createSubmission({
        user_id: user.id,
        personal_info: {
          fullName: data.fullName,
          email: data.email,
          countryOfCitizenship: data.countryOfCitizenship,
          countryOfResidence: data.countryOfResidence,
          ageGroup: data.ageGroup,
          maritalStatus: data.maritalStatus,
          hasChildren: data.hasChildren,
          childrenAges: data.childrenAges,
        },
        education_info: {
          highestEducation: data.highestEducation,
          educationOutsideCanada: data.educationOutsideCanada,
        },
        work_experience: {
          yearsOfExperience: data.yearsOfExperience,
          workInRegulatedProfession: data.workInRegulatedProfession,
          occupation: data.occupation,
        },
        language_skills: {
          speakEnglishOrFrench: data.speakEnglishOrFrench,
          languageTest: data.languageTest,
          testScores: data.testScores,
        },
        canadian_connections: {
          interestedInImmigrating: data.interestedInImmigrating,
          studiedOrWorkedInCanada: data.studiedOrWorkedInCanada,
          jobOfferFromCanadianEmployer: data.jobOfferFromCanadianEmployer,
          relativesInCanada: data.relativesInCanada,
          settlementFunds: data.settlementFunds,
        },
        additional_info: {
          businessOrManagerialExperience: data.businessOrManagerialExperience,
          additionalInfo: data.additionalInfo,
        },
        submission_status: 'draft',
      })

      setSaveMessage('Draft saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving draft:', error)
      setSaveMessage('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
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
          childrenAges: data.childrenAges,
        },
        education_info: {
          highestEducation: data.highestEducation,
          educationOutsideCanada: data.educationOutsideCanada,
        },
        work_experience: {
          yearsOfExperience: data.yearsOfExperience,
          workInRegulatedProfession: data.workInRegulatedProfession,
          occupation: data.occupation,
        },
        language_skills: {
          speakEnglishOrFrench: data.speakEnglishOrFrench,
          languageTest: data.languageTest,
          testScores: data.testScores,
        },
        canadian_connections: {
          interestedInImmigrating: data.interestedInImmigrating,
          studiedOrWorkedInCanada: data.studiedOrWorkedInCanada,
          jobOfferFromCanadianEmployer: data.jobOfferFromCanadianEmployer,
          relativesInCanada: data.relativesInCanada,
          settlementFunds: data.settlementFunds,
        },
        additional_info: {
          businessOrManagerialExperience: data.businessOrManagerialExperience,
          additionalInfo: data.additionalInfo,
        },
        submission_status: 'submitted',
      })

      if (referenceId) {
        // Send webhook for eligibility form submission
        try {
          await sendEligibilityFormWebhook(
            user.id,
            user.email || data.email,
            user.user_metadata?.full_name || data.fullName,
            data
          )
          console.log('Eligibility form webhook sent successfully')
        } catch (webhookError) {
          console.error('Failed to send eligibility form webhook:', webhookError)
          // Don't fail the form submission if webhook fails
        }

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

  const handleStartAssessment = () => {
    setShowForm(true)
  }

  const handleBackToDashboard = () => {
    setShowForm(false)
  }

  const handleNewAssessment = () => {
    reset()
    setValue('fullName', profile?.full_name || '')
    setValue('email', user?.email || '')
    setShowForm(true)
  }

  if (loadingSubmissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // If showing form, render the eligibility form
  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={handleBackToDashboard}
            className="text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
        <EligibilityForm
          onSubmissionSuccess={onSubmissionSuccess}
          onAuthRequired={() => {}} // Not needed since user is already authenticated
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your immigration eligibility assessments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleNewAssessment}
              className="btn-primary flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              {previousSubmissions.length > 0 ? 'New Assessment' : 'Start Assessment'}
            </button>
          </div>
        </div>

        {/* Previous Submissions Summary */}
        {previousSubmissions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Your Assessment History</h3>
            <div className="space-y-2">
              {previousSubmissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="font-mono text-gray-700">{submission.reference_id}</span>
                    <span className="ml-2 text-gray-600">
                      ({new Date(submission.created_at).toLocaleDateString()})
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.submission_status === 'submitted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.submission_status}
                  </span>
                </div>
              ))}
            </div>
            {previousSubmissions.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                And {previousSubmissions.length - 3} more submissions...
              </p>
            )}
          </div>
        )}

        {/* No Previous Submissions */}
        {previousSubmissions.length === 0 && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-blue-800 mb-2">Ready to Get Started?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Complete your first immigration eligibility assessment to receive personalized recommendations from our licensed consultants.
            </p>
            <button
              onClick={handleStartAssessment}
              className="btn-primary"
            >
              Start Your Assessment
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      {previousSubmissions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {previousSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-gray-600">{submission.reference_id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.submission_status === 'submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.submission_status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Occupation:</strong> {submission.work_experience?.occupation || 'Not specified'}</p>
                      <p><strong>Country:</strong> {submission.personal_info?.countryOfCitizenship || 'Not specified'}</p>
                      <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Assessments</span>
                  <span className="font-semibold text-gray-900">{previousSubmissions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-semibold text-green-600">
                    {previousSubmissions.filter(s => s.submission_status === 'submitted').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Drafts</span>
                  <span className="font-semibold text-yellow-600">
                    {previousSubmissions.filter(s => s.submission_status === 'draft').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Assessment Review</p>
                    <p className="text-xs text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Detailed Report</p>
                    <p className="text-xs text-gray-600">5-7 business days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Consultation</p>
                    <p className="text-xs text-gray-600">Within 10 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}