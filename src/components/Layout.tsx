import React from "react";
import { LogOut, User, FileText, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
  onShowAuth?: (type: "login" | "signup") => void;
}

export function Layout({ children, onShowAuth }: LayoutProps) {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log("🚪 User signing out...");
      await signOut();
      console.log(
        "✅ Sign out successful, user will be redirected to landing page"
      );
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  };

  const handleShowAuth = (type: "login" | "signup") => {
    if (onShowAuth) {
      onShowAuth(type);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-red-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">
                  Immigration Eligibility Assessment
                </h1>
              </div>
            </div>

            {/* Auth Buttons / User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleShowAuth("login")}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => handleShowAuth("signup")}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 Immigration Eligibility Assessment. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Assessments are completed by licensed Canadian immigration
              consultants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
