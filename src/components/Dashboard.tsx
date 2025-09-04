import { useState, useEffect } from "react";
import {
  CheckCircle,
  Users,
  FileText,
  Clock,
  RefreshCw,
  Edit,
} from "lucide-react";
import { FormData } from "../types/form";
import { useAuth } from "../hooks/useAuth";
import { EligibilityForm } from "./EligibilityForm";
import {
  fetchUserSubmissions,
  EligibilitySubmission,
  submissionDataToFormData,
} from "../lib/eligibilitySubmissions";

interface DashboardProps {
  onSubmissionSuccess: (referenceId: string) => void;
  pendingFormData?: FormData;
  onClearPendingData?: () => void;
}

export function Dashboard({
  onSubmissionSuccess,
  pendingFormData,
  onClearPendingData,
}: DashboardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [existingSubmissions, setExistingSubmissions] = useState<
    EligibilitySubmission[]
  >([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [editingSubmission, setEditingSubmission] =
    useState<EligibilitySubmission | null>(null);

  // Load existing submissions for the user
  useEffect(() => {
    if (!user) return;

    const loadSubmissions = async () => {
      try {
        setLoadingSubmissions(true);
        console.log("🔄 Loading submissions for user:", user.id);

        const submissions = await fetchUserSubmissions(user.id);

        setExistingSubmissions(submissions);
        console.log("✅ Loaded submissions:", submissions.length);
      } catch (error) {
        console.error("❌ Error loading submissions:", error);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    loadSubmissions();
  }, [user]);

  // Load user's pending form data if available
  useEffect(() => {
    if (!user) return;

    try {
      console.log("🔄 Loading user data for:", user.id);

      // Priority 1: Use pending form data if available (from Step 1)
      if (pendingFormData) {
        console.log("📝 Using pending form data from Step 1:", pendingFormData);
        // Show form immediately with pending data
        setShowForm(true);
      } else {
        console.log("📝 No pending data, showing dashboard");
        // Don't show form automatically - show dashboard content instead
        setShowForm(false);
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      // Even if there's an error, show the dashboard
      setShowForm(false);
    }
  }, [user, pendingFormData]);

  // Handle successful form submission
  const handleSubmissionSuccess = (referenceId: string) => {
    console.log("✅ Form submission successful:", referenceId);

    // Refresh submissions list
    handleRefreshSubmissions();

    // Clear editing state
    setEditingSubmission(null);
    setShowForm(false);

    // Call parent callback
    onSubmissionSuccess(referenceId);
  };

  const handleStartAssessment = () => {
    setShowForm(true);
  };

  const handleBackToDashboard = () => {
    setShowForm(false);
    // Clear pending form data after it's been used
    if (pendingFormData && onClearPendingData) {
      onClearPendingData();
    }
  };

  const handleNewAssessment = () => {
    setEditingSubmission(null);
    setShowForm(true);
  };

  const handleEditSubmission = (submission: EligibilitySubmission) => {
    console.log("✏️ Editing submission:", submission.reference_id);
    setEditingSubmission(submission);
    setShowForm(true);
  };

  const handleRefreshSubmissions = async () => {
    if (!user) return;

    try {
      setLoadingSubmissions(true);
      const submissions = await fetchUserSubmissions(user.id);

      setExistingSubmissions(submissions);
    } catch (error) {
      console.error("❌ Error refreshing submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

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

        {/* Show message if form is pre-populated with pending data */}
        {pendingFormData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Your form data from Step 1 has been pre-populated. You can
                review and edit before submitting.
              </p>
            </div>
          </div>
        )}

        {/* Show message if editing existing submission */}
        {editingSubmission && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Editing Submission: {editingSubmission.reference_id}
                  </p>
                  <p className="text-xs text-green-700">
                    Last updated:{" "}
                    {new Date(
                      editingSubmission.updated_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingSubmission(null);
                  setShowForm(false);
                }}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                Cancel Edit
              </button>
            </div>
          </div>
        )}

        <EligibilityForm
          onSubmissionSuccess={handleSubmissionSuccess}
          onAuthRequired={() => {}} // Not needed since user is already authenticated
          editingSubmissionId={editingSubmission?.reference_id}
          prePopulatedData={
            editingSubmission
              ? submissionDataToFormData(editingSubmission)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.full_name || user?.email}!
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
              Start Assessment
            </button>
          </div>
        </div>

        {/* Show existing submissions or start new assessment */}
        {!pendingFormData && (
          <div className="mt-6">
            {loadingSubmissions ? (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your submissions...</p>
              </div>
            ) : existingSubmissions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Your Submissions ({existingSubmissions.length})
                  </h3>
                  <button
                    onClick={handleRefreshSubmissions}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                </div>

                <div className="grid gap-4">
                  {existingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-800">
                              {submission.reference_id}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                submission.submission_status === "submitted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {submission.submission_status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>
                              Created:{" "}
                              {new Date(
                                submission.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              Updated:{" "}
                              {new Date(
                                submission.updated_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <button onClick={handleNewAssessment} className="btn-primary">
                    Create New Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-medium text-blue-800 mb-2">
                  Ready to Get Started?
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Complete your immigration eligibility assessment to receive
                  personalized recommendations from our licensed consultants.
                </p>
                <button onClick={handleStartAssessment} className="btn-primary">
                  Start Your Assessment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pending Form Data Message */}
        {pendingFormData && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-medium text-green-800 mb-2">
              Form Data Ready!
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Your eligibility form data from Step 1 is ready to be submitted.
              Click below to review and complete your assessment.
            </p>
            <button onClick={handleStartAssessment} className="btn-primary">
              Complete Your Assessment
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Assessment Process
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Complete Assessment Form
                  </p>
                  <p className="text-xs text-gray-600">
                    Fill out the comprehensive eligibility assessment form
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Data Processing
                  </p>
                  <p className="text-xs text-gray-600">
                    Your information is processed and sent to our consultants
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Expert Review
                  </p>
                  <p className="text-xs text-gray-600">
                    Licensed consultants review your eligibility
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Personalized Report
                  </p>
                  <p className="text-xs text-gray-600">
                    Receive detailed recommendations and next steps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Next Steps
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Assessment Review
                  </p>
                  <p className="text-xs text-gray-600">2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Detailed Report
                  </p>
                  <p className="text-xs text-gray-600">5-7 business days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Consultation
                  </p>
                  <p className="text-xs text-gray-600">
                    Within 10 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What You'll Get
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Eligibility Score
                  </p>
                  <p className="text-xs text-gray-600">
                    Comprehensive assessment of your chances
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Program Recommendations
                  </p>
                  <p className="text-xs text-gray-600">
                    Best immigration pathways for you
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Action Plan
                  </p>
                  <p className="text-xs text-gray-600">
                    Step-by-step guidance to improve eligibility
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
