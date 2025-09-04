import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { FormData } from "../types/form";

interface AuthFormProps {
  type: "login" | "signup";
  pendingFormData?: FormData;
  onAuthSuccess: (referenceId?: string) => void;
}

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
}

export function AuthForm({
  type,
  pendingFormData,
  onAuthSuccess,
}: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(type === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp, signIn } = useAuth();

  // Update isSignUp when type prop changes
  useEffect(() => {
    setIsSignUp(type === "signup");
  }, [type]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!data.fullName) {
          setError("Full name is required for sign up");
          return;
        }

        console.log("🔐 Attempting to sign up user:", data.email);
        console.log("📝 Pending form data:", pendingFormData);
        console.log("📝 Full name:", data.fullName);

        const result = await signUp(
          data.email,
          data.password,
          data.fullName,
          pendingFormData
        );
        console.log("🔐 Signup result:", result);

        // Show success message and redirect to sign in
        setError(null);

        // Show success message
        alert(
          "Account created successfully! Please check your email for verification and then sign in."
        );

        // Switch to sign in mode
        setIsSignUp(false);
        reset();
      } else {
        const result = await signIn(data.email, data.password);

        // If we have pending form data and user just signed in, just proceed without webhook
        if (pendingFormData && result.user) {
          // Generate a reference ID for the form submission
          const referenceId = `webhook_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          onAuthSuccess(referenceId);
        } else {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);

      // Provide more specific error messages
      let errorMessage = "An error occurred during authentication";

      if (err.message) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (err.message.includes("User already registered")) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        } else if (err.message.includes("Password should be at least")) {
          errorMessage = "Password must be at least 6 characters long";
        } else if (err.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address";
        } else if (err.message.includes("Database error")) {
          errorMessage =
            "Account created but profile setup failed. Please try signing in with your new account.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp
                ? "Create an account to save your assessment"
                : pendingFormData
                ? "Sign in to complete your assessment submission"
                : "Sign in to access your immigration assessments"}
            </p>
          </div>

          {pendingFormData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Your assessment form is ready to submit. Please sign in or
                  create an account to continue.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="form-label">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("fullName", {
                      required: isSignUp ? "Full name is required" : false,
                    })}
                    className="form-input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="form-error">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                  defaultValue={pendingFormData?.email || ""}
                />
              </div>
              {errors.email && (
                <p className="form-error">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
