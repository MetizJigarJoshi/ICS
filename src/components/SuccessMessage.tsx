import React from 'react'
import { CheckCircle, FileText, Mail, ArrowRight } from 'lucide-react'

interface SuccessMessageProps {
  referenceId: string
  onStartNew: () => void
}

export function SuccessMessage({ referenceId, onStartNew }: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Assessment Submitted Successfully!</h1>
            <p className="text-green-100 text-lg">
              Your immigration eligibility assessment has been received and is being processed.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Reference ID */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Your Reference ID</h2>
              </div>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                <code className="text-2xl font-mono font-bold text-red-600 tracking-wider">
                  {referenceId}
                </code>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Please save this reference ID for your records. You'll need it to track your assessment.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <ArrowRight className="h-5 w-5 text-red-600 mr-2" />
                What Happens Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Review Process</h3>
                    <p className="text-gray-600 text-sm">
                      A licensed Canadian immigration consultant will review your information and assess your eligibility for various immigration programs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Personalized Report</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive a detailed report outlining your immigration options, eligibility scores, and recommended next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Follow-up Consultation</h3>
                    <p className="text-gray-600 text-sm">
                      If eligible, you'll be contacted to discuss your options and potential next steps in detail.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-800">Email Confirmation</h3>
                  <p className="text-blue-700 text-sm">
                    A confirmation email has been sent to your registered email address with your reference ID and next steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Expected Timeline</h3>
              <p className="text-yellow-700 text-sm">
                <strong>Initial Review:</strong> 2-3 business days<br />
                <strong>Detailed Report:</strong> 5-7 business days<br />
                <strong>Consultation Scheduling:</strong> Within 10 business days (if applicable)
              </p>
            </div>

            {/* Action Button */}
            <div className="text-center pt-4">
              <button
                onClick={onStartNew}
                className="btn-primary"
              >
                Submit Another Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}