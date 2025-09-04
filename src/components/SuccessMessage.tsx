import React from "react";
import { CheckCircle, Clock, FileText, Shield, CreditCard, ArrowLeft } from "lucide-react";

interface SuccessMessageProps {
  onStartNew: () => void;
}

export function SuccessMessage({ onStartNew }: SuccessMessageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onStartNew}
          className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Submitted Successfully!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for completing your immigration eligibility assessment
        </p>
      </div>

      <div className="space-y-6">
        {/* What Happens Next */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">What Happens Next</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">You'll receive an automatic confirmation by email</p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Our licensed consultant will review your answers</p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Please proceed to payment below to receive your report</p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Once payment is received, we'll send your eligibility report by email</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-lg">📧</div>
              <p className="text-blue-800 text-sm">
                You will also receive a confirmation email with payment details for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Order Your Immigration Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Order Your Immigration Report</h2>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="flex items-start space-x-4 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Get a Personalized RCIC Review – $39 USD
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">You'll receive a PDF report within 24–48 hours</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 mt-0.5 flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-3 bg-red-500 rounded-sm relative">
                          <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-1"></div>
                        </div>
                      </div>
                      <span className="text-gray-600">Reviewed by a Licensed Canadian Immigration Consultant (RCIC)</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-500 text-lg mt-0.5 flex-shrink-0">💡</div>
                      <span className="text-gray-600">Includes specific advice based on your immigration goals</span>
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                💳 Pay with Stripe ($39 USD)
              </a>
              
              <a 
                href="https://www.paypal.com/ncp/payment/UQK88YJA6AEBY"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                💳 Pay with PayPal ($39 USD)
              </a>
            </div>
          </div>
        </div>

        {/* Secure & Trusted */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Secure & Trusted</h3>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="text-yellow-600 text-lg mr-2">🔒</div>
              <span>SSL Secure</span>
            </div>
            
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <span>Stripe Payments</span>
            </div>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span>GDPR-Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}