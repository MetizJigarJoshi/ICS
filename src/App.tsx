import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { EligibilityForm } from "./components/EligibilityForm";
import { Dashboard } from "./components/Dashboard";
import { AuthForm } from "./components/AuthForm";
import { SuccessMessage } from "./components/SuccessMessage";
import { useAuth } from "./hooks/useAuth";
import { FormData } from "./types/form";

type AppState = "form" | "auth" | "success" | "dashboard";

function App() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("form");
  const [pendingFormData, setPendingFormData] = useState<
    FormData | undefined
  >();
  const [submissionReferenceId, setSubmissionReferenceId] =
    useState<string>("");
  const [authType, setAuthType] = useState<"login" | "signup">("login");

  // Update app state when user auth changes
  React.useEffect(() => {
    console.log(
      "🔄 App auth state change - loading:",
      loading,
      "user:",
      user?.email || "null"
    );

    if (!loading) {
      if (user) {
        // If user is logged in, go to dashboard to load their data
        console.log("👤 User logged in, redirecting to dashboard");
        setAppState("dashboard");
      } else {
        // If no user (including after sign out), redirect to form and clear all state
        console.log("🚪 No user (sign out), redirecting to form");
        setAppState("form");
        setPendingFormData(undefined);
        setSubmissionReferenceId("");
        setAuthType("login");
      }
    }
  }, [user, loading]);

  // Show loading screen while auth is being determined
  if (loading) {
    console.log("⏳ Showing loading screen");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleFormSubmissionSuccess = (referenceId: string) => {
    setSubmissionReferenceId(referenceId);
    setAppState("success");
    setPendingFormData(undefined);
  };

  const handleAuthRequired = (formData: FormData) => {
    setPendingFormData(formData);
    setAuthType("signup");
    setAppState("auth");
  };

  const handleShowAuth = (type: "login" | "signup") => {
    setAuthType(type);
    setAppState("auth");
  };

  const handleAuthSuccess = (referenceId?: string) => {
    if (referenceId) {
      // User signed in and form was submitted
      setSubmissionReferenceId(referenceId);
      setAppState("success");
    } else {
      // User just signed in, go to dashboard with pending form data
      setAppState("dashboard");
    }
    // Don't clear pendingFormData yet - Dashboard needs it
  };

  const handleStartNew = () => {
    setAppState("dashboard");
    setPendingFormData(undefined);
    setSubmissionReferenceId("");
  };

  const renderContent = () => {
    console.log("🎨 Rendering content for appState:", appState);

    switch (appState) {
      case "form":
        console.log("📝 Rendering EligibilityForm");
        return (
          <EligibilityForm
            onSubmissionSuccess={handleFormSubmissionSuccess}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "auth":
        console.log("🔐 Rendering AuthForm");
        return (
          <AuthForm
            type={authType}
            pendingFormData={pendingFormData}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case "success":
        console.log("✅ Rendering SuccessMessage");
        return (
          <SuccessMessage
            referenceId={submissionReferenceId}
            onStartNew={handleStartNew}
          />
        );
      case "dashboard":
        console.log("📊 Rendering Dashboard");
        return <Dashboard onSubmissionSuccess={handleFormSubmissionSuccess} />;
      default:
        console.log("🔄 Rendering default EligibilityForm");
        return (
          <EligibilityForm
            onSubmissionSuccess={handleFormSubmissionSuccess}
            onAuthRequired={handleAuthRequired}
          />
        );
    }
  };

  // Don't show layout for auth and success pages
  if (appState === "auth" || appState === "success") {
    console.log("🚫 Not showing Layout for appState:", appState);
    return renderContent();
  }

  console.log("🏗️ Rendering with Layout for appState:", appState);
  return <Layout onShowAuth={handleShowAuth}>{renderContent()}</Layout>;
}

export default App;
