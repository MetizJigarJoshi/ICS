import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { EligibilityForm } from './components/EligibilityForm'
import { Dashboard } from './components/Dashboard'
import { AuthForm } from './components/AuthForm'
import { SuccessMessage } from './components/SuccessMessage'
import { useAuth } from './hooks/useAuth'
import { FormData } from './types/form'

type AppState = 'form' | 'auth' | 'success' | 'dashboard'

function App() {
  const { user, loading } = useAuth()
  const [appState, setAppState] = useState<AppState>(user ? 'dashboard' : 'form')
  const [pendingFormData, setPendingFormData] = useState<FormData | undefined>()
  const [submissionReferenceId, setSubmissionReferenceId] = useState<string>('')

  // Update app state when user auth changes
  React.useEffect(() => {
    if (!loading && user) {
      setAppState('dashboard')
    } else if (!loading && !user) {
      setAppState('form')
    }
  }, [user, loading])

  // Show loading screen while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }
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
      // User just signed in, go to dashboard
      setAppState('dashboard')
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
      case 'dashboard':
      default:
        return (
          <Dashboard
            onSubmissionSuccess={handleFormSubmissionSuccess}
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