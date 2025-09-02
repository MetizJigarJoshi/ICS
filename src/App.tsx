import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { EligibilityForm } from './components/EligibilityForm'
import { AuthForm } from './components/AuthForm'
import { SuccessMessage } from './components/SuccessMessage'
import { useAuth } from './hooks/useAuth'
import { FormData } from './types/form'

type AppState = 'form' | 'auth' | 'success'

function App() {
  const { user } = useAuth()
  const [appState, setAppState] = useState<AppState>('form')
  const [pendingFormData, setPendingFormData] = useState<FormData | undefined>()
  const [submissionReferenceId, setSubmissionReferenceId] = useState<string>('')

  const handleFormSubmissionSuccess = (referenceId: string) => {
    setSubmissionReferenceId(referenceId)
    setAppState('success')
    setPendingFormData(undefined)
  }

  const handleAuthRequired = (formData: FormData) => {
    setPendingFormData(formData)
    setAppState('auth')
  }

  const handleAuthSuccess = (referenceId?: string) => {
    if (referenceId) {
      // User signed in and form was submitted
      setSubmissionReferenceId(referenceId)
      setAppState('success')
    } else {
      // User just signed in, go back to form
      setAppState('form')
    }
    setPendingFormData(undefined)
  }

  const handleStartNew = () => {
    setAppState('form')
    setPendingFormData(undefined)
    setSubmissionReferenceId('')
  }

  const renderContent = () => {
    switch (appState) {
      case 'auth':
        return (
          <AuthForm
            pendingFormData={pendingFormData}
            onAuthSuccess={handleAuthSuccess}
          />
        )
      case 'success':
        return (
          <SuccessMessage
            referenceId={submissionReferenceId}
            onStartNew={handleStartNew}
          />
        )
      case 'form':
      default:
        return (
          <EligibilityForm
            onSubmissionSuccess={handleFormSubmissionSuccess}
            onAuthRequired={handleAuthRequired}
          />
        )
    }
  }

  // Don't show layout for auth and success pages
  if (appState === 'auth' || appState === 'success') {
    return renderContent()
  }

  return (
    <Layout>
      {renderContent()}
    </Layout>
  )
}

export default App