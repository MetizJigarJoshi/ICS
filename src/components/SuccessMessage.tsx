import React from "react";
import { CheckCircle, Mail, Clock, FileText, Shield, CreditCard } from "lucide-react";

interface SuccessMessageProps {
  onStartNew: () => void;
}

export function SuccessMessage({ onStartNew }: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* What Happens Next Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">What Happens Next</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <p className="text-gray-700 text-lg">
                You'll receive an automatic confirmation by email
              </p>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <p className="text-gray-700 text-lg">
                Our licensed consultant will review your answers
              </p>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <p className="text-gray-700 text-lg">
                Please proceed to payment below to receive your report
              </p>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <p className="text-gray-700 text-lg">
                Once payment is received, we'll send your eligibility report by email
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 text-sm">
                You will also receive a confirmation email with payment details for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Order Your Immigration Report Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Order Your Immigration Report</h2>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="flex items-start space-x-4 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Get a Personalized RCIC Review – $39 USD
                  </h3>
                  
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">You'll receive a PDF report within 24–48 hours</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-6 h-4 mr-2 flex items-center justify-center">
                        <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-full absolute"></div>
                      </div>
                      <span className="text-sm">Reviewed by a Licensed Canadian Immigration Consultant (RCIC)</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 text-yellow-500">💡</div>
                      <span className="text-sm">Includes specific advice based on your immigration goals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-4">
              <a 
                href="https://buy.stripe.com/fZu14ngrhaFvdNh2IT0x200"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                💳 Pay with Stripe ($39 USD)
              </a>
              
              <a 
                href="https://www.paypal.com/ncp/payment/UQK88YJA6AEBY"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                💳 Pay with PayPal ($39 USD)
              </a>
            </div>
          </div>
        </div>

        {/* Secure & Trusted Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Secure & Trusted</h3>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <span>🔒 SSL Secure</span>
              </div>
              
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <span>💳 Stripe Payments</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span>🛡️ GDPR-Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="text-center">
          <button
            onClick={onStartNew}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}