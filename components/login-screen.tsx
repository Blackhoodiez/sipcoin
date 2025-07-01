// components/login-screen.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGoogle, FaApple } from "react-icons/fa";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ForgotPassword from "./forgot-password";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData extends LoginFormData {
  fullName: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string;
}

interface FormError {
  field: string;
  message: string;
}

interface ValidationState {
  isValid: boolean;
  message: string;
}

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<SignupFormData>({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  const [validationState, setValidationState] = useState<
    Record<string, ValidationState>
  >({
    email: { isValid: true, message: "" },
    password: { isValid: true, message: "" },
    fullName: { isValid: true, message: "" },
    confirmPassword: { isValid: true, message: "" },
    acceptTerms: { isValid: true, message: "" },
  });
  const MAX_ATTEMPTS_BEFORE_CAPTCHA = 3;
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const { login, signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we're coming from a successful signup
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("signup") === "success") {
      setShowSuccessMessage(true);

      // Pre-fill email if provided
      const email = searchParams.get("email");
      if (email) {
        setLoginData((prev) => ({ ...prev, email }));
        handleEmailChange(email, true);
      }

      // Switch to login tab
      setActiveTab("login");

      // Clear the URL parameter
      window.history.replaceState({}, "", "/auth/login");
    }
  }, []);

  const clearErrors = () => {
    setFormErrors([]);
  };

  const addError = (field: string, message: string) => {
    setFormErrors((prev) => [...prev, { field, message }]);
  };

  const getFieldError = (field: string) => {
    return formErrors.find((error) => error.field === field)?.message;
  };

  const validateEmail = (email: string): ValidationState => {
    if (!email) {
      return { isValid: false, message: "Email is required" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    if (email.length > 254) {
      return { isValid: false, message: "Email is too long" };
    }
    return { isValid: true, message: "" };
  };

  const validatePassword = (password: string): ValidationState => {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    }

    const requirements = {
      minLength: password.length >= 8,
      maxLength: password.length <= 128,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSpaces: !/\s/.test(password),
      noCommonPatterns: !/(password|123456|qwerty|admin)/i.test(password),
    };

    const failedRequirements = [];
    if (!requirements.minLength)
      failedRequirements.push("at least 8 characters");
    if (!requirements.maxLength)
      failedRequirements.push("no more than 128 characters");
    if (!requirements.hasUppercase)
      failedRequirements.push("one uppercase letter");
    if (!requirements.hasLowercase)
      failedRequirements.push("one lowercase letter");
    if (!requirements.hasNumber) failedRequirements.push("one number");
    if (!requirements.hasSpecialChar)
      failedRequirements.push("one special character");
    if (!requirements.noSpaces) failedRequirements.push("no spaces");
    if (!requirements.noCommonPatterns)
      failedRequirements.push("no common patterns");

    if (failedRequirements.length > 0) {
      return {
        isValid: false,
        message: `Password must contain ${failedRequirements.join(", ")}`,
      };
    }

    return { isValid: true, message: "" };
  };

  const validateFullName = (name: string): ValidationState => {
    if (!name) {
      return { isValid: false, message: "Full name is required" };
    }
    if (name.length < 2) {
      return {
        isValid: false,
        message: "Full name must be at least 2 characters long",
      };
    }
    if (name.length > 100) {
      return { isValid: false, message: "Full name is too long" };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return {
        isValid: false,
        message:
          "Full name can only contain letters, spaces, hyphens, and apostrophes",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): ValidationState => {
    if (!confirmPassword) {
      return { isValid: false, message: "Please confirm your password" };
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: "Passwords do not match" };
    }
    return { isValid: true, message: "" };
  };

  const handleEmailChange = (email: string, isLogin: boolean = true) => {
    const validation = validateEmail(email);
    setValidationState((prev) => ({
      ...prev,
      email: validation,
    }));
    if (isLogin) {
      setLoginData((prev) => ({ ...prev, email }));
    } else {
      setSignupData((prev) => ({ ...prev, email }));
    }
    if (getFieldError("email")) clearErrors();
  };

  const handlePasswordChange = (password: string, isLogin: boolean = true) => {
    const validation = validatePassword(password);
    setValidationState((prev) => ({
      ...prev,
      password: validation,
    }));
    if (isLogin) {
      setLoginData((prev) => ({ ...prev, password }));
    } else {
      setSignupData((prev) => ({ ...prev, password }));
      setPasswordStrength(checkPasswordStrength(password));
    }
    if (getFieldError("password")) clearErrors();
  };

  const handleFullNameChange = (name: string) => {
    const validation = validateFullName(name);
    setValidationState((prev) => ({
      ...prev,
      fullName: validation,
    }));
    setSignupData((prev) => ({ ...prev, fullName: name }));
    if (getFieldError("fullName")) clearErrors();
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    const validation = validateConfirmPassword(
      signupData.password,
      confirmPassword
    );
    setValidationState((prev) => ({
      ...prev,
      confirmPassword: validation,
    }));
    setSignupData((prev) => ({ ...prev, confirmPassword }));
    if (getFieldError("confirmPassword")) clearErrors();
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length check (up to 3 points)
    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long");
    } else {
      score += Math.min(Math.floor(password.length / 4), 3);
    }

    // Character variety (up to 4 points)
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // Complexity bonus (up to 2 points)
    if (password.length >= 12) score += 1;
    if (
      /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(
        password
      )
    ) {
      score += 1;
    }

    // Penalties
    if (/\s/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push("Avoid using spaces in your password");
    }
    if (/(password|123456|qwerty|admin)/i.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push("Avoid using common passwords or patterns");
    }
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push("Avoid repeating characters");
    }

    // Calculate final score (0-5)
    const finalScore = Math.min(Math.max(Math.floor(score), 0), 5);

    // Generate feedback based on score
    if (finalScore < 2) {
      feedback.push("Your password is very weak. Please make it stronger.");
    } else if (finalScore < 3) {
      feedback.push("Your password is weak. Consider adding more variety.");
    } else if (finalScore < 4) {
      feedback.push("Your password is moderate. It could be stronger.");
    } else if (finalScore < 5) {
      feedback.push("Your password is strong. Good job!");
    } else {
      feedback.push("Your password is very strong. Excellent!");
    }

    return {
      score: finalScore,
      feedback: feedback.join(". "),
    };
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-emerald-500";
      default:
        return "bg-red-500";
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Moderate";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "Very Weak";
    }
  };

  const checkRateLimit = async (email: string, type: "login" | "signup") => {
    try {
      // Get IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      if (!ipResponse.ok) {
        console.error("Failed to get IP address:", await ipResponse.text());
        return true; // Allow the request if IP check fails
      }

      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      console.log("Checking rate limit for:", { email, type, ip });

      const response = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          type,
          ip,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid response type:", contentType);
        return true; // Allow the request if response is not JSON
      }

      if (!response.ok) {
        console.error(
          "Rate limit check failed:",
          response.status,
          response.statusText
        );
        return true; // Allow the request if rate limit check fails
      }

      const data = await response.json();
      console.log("Rate limit response:", data);

      if (!data.success) {
        setIsRateLimited(true);
        if (data.reset) {
          setRateLimitReset(data.reset);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Rate limit check error:", error);
      return true; // Allow the request if rate limit check fails
    }
  };

  const verifyCaptcha = async (token: string, action: string) => {
    try {
      const response = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("CAPTCHA verification error:", error);
      return false;
    }
  };

  const validateLoginForm = () => {
    clearErrors();
    let isValid = true;

    const emailValidation = validateEmail(loginData.email);
    const passwordValidation = validatePassword(loginData.password);

    if (!emailValidation.isValid) {
      addError("email", emailValidation.message);
      isValid = false;
    }

    if (!passwordValidation.isValid) {
      addError("password", passwordValidation.message);
      isValid = false;
    }

    if (showCaptcha && !captchaToken) {
      addError("captcha", "Please complete the CAPTCHA");
      isValid = false;
    }

    return isValid;
  };

  const validateSignupForm = () => {
    clearErrors();
    let isValid = true;

    const fullNameValidation = validateFullName(signupData.fullName);
    const emailValidation = validateEmail(signupData.email);
    const passwordValidation = validatePassword(signupData.password);
    const confirmPasswordValidation = validateConfirmPassword(
      signupData.password,
      signupData.confirmPassword
    );

    if (!fullNameValidation.isValid) {
      addError("fullName", fullNameValidation.message);
      isValid = false;
    }

    if (!emailValidation.isValid) {
      addError("email", emailValidation.message);
      isValid = false;
    }

    if (!passwordValidation.isValid) {
      addError("password", passwordValidation.message);
      isValid = false;
    }

    if (!confirmPasswordValidation.isValid) {
      addError("confirmPassword", confirmPasswordValidation.message);
      isValid = false;
    }

    if (!signupData.acceptTerms) {
      addError(
        "acceptTerms",
        "You must accept the Terms of Service to continue"
      );
      isValid = false;
    }

    if (showCaptcha && !captchaToken) {
      addError("captcha", "Please complete the CAPTCHA");
      isValid = false;
    }

    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateLoginForm()) {
      return;
    }

    const isRateLimited = await checkRateLimit(loginData.email, "login");
    if (!isRateLimited) {
      const minutes = Math.ceil((rateLimitReset! - Date.now()) / 60000);
      addError(
        "rateLimit",
        `Too many login attempts. Please try again in ${minutes} minutes.`
      );
      return;
    }

    if (showCaptcha) {
      const isCaptchaValid = await verifyCaptcha(captchaToken!, "login");
      if (!isCaptchaValid) {
        addError("captcha", "CAPTCHA verification failed. Please try again.");
        return;
      }
    }

    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);

      // Reset states on successful login
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken(null);
      clearErrors();
      toast.success("Logged in successfully!");
      onLogin();
    } catch (error: any) {
      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_ATTEMPTS_BEFORE_CAPTCHA) {
          setShowCaptcha(true);
        }
        return newAttempts;
      });

      // Handle specific error cases
      if (error.message?.includes("Email not confirmed")) {
        addError(
          "email",
          "Please verify your email address before logging in. Check your inbox for the verification link."
        );
        // Show resend verification option
        toast.error("Email not verified", {
          action: {
            label: "Resend Verification",
            onClick: async () => {
              try {
                await signup(loginData.email, loginData.password, "");
                toast.success("Verification email resent successfully!");
              } catch (err: any) {
                toast.error(
                  err.message || "Failed to resend verification email"
                );
              }
            },
          },
        });
      } else if (error.message?.includes("Invalid login credentials")) {
        addError("auth", "Invalid email or password. Please try again.");
      } else if (error.message?.includes("Email not found")) {
        addError(
          "email",
          "No account found with this email. Please sign up first."
        );
        setActiveTab("signup");
        // Pre-fill the signup form with the email
        setSignupData((prev) => ({ ...prev, email: loginData.email }));
      } else {
        addError("auth", error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    // Validate form
    if (!validateSignupForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Check rate limit first
      const rateLimitResponse = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          type: "signup",
          ip: window.location.hostname,
        }),
      });

      const rateLimitData = await rateLimitResponse.json();

      if (!rateLimitData.success) {
        if (rateLimitResponse.status === 429) {
          setIsRateLimited(true);
          setRateLimitReset(rateLimitData.reset);
          addError("auth", rateLimitData.error);
          return;
        }
        throw new Error(rateLimitData.error || "Rate limit check failed");
      }

      await signup(signupData.email, signupData.password, signupData.fullName);
      setShowVerificationMessage(true);
      // Reset form
      setSignupData({
        email: "",
        password: "",
        fullName: "",
        confirmPassword: "",
        acceptTerms: false,
      });
      // Reset states
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken(null);
      clearErrors();
    } catch (error: any) {
      console.error("Signup error details:", error);
      // Handle specific error cases
      if (error.message?.includes("already registered")) {
        addError(
          "email",
          "This email is already registered. Please try logging in instead."
        );
        setActiveTab("login");
        setLoginData((prev) => ({ ...prev, email: signupData.email }));
      } else if (error.message?.includes("network")) {
        addError(
          "auth",
          "Network error. Please check your connection and try again."
        );
      } else if (error.message?.includes("database")) {
        addError("auth", "Failed to create user profile. Please try again.");
      } else {
        addError(
          "auth",
          error.message || "An unexpected error occurred. Please try again."
        );
      }

      // Increment failed attempts for rate limiting
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= MAX_ATTEMPTS_BEFORE_CAPTCHA) {
        setShowCaptcha(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      // TODO: Implement social login
      toast.info(`${provider} login coming soon!`);
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Social login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 text-center">
            SipCoin
          </h1>
          <p className="text-zinc-300 text-sm text-center mb-8">
            Drink. Earn. Repeat.
          </p>
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 text-center">
          SipCoin
        </h1>
        <p className="text-zinc-300 text-sm text-center mb-8">
          Drink. Earn. Repeat.
        </p>

        {showSuccessMessage && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-6 text-center animate-in slide-in-from-top-2 duration-500">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-in zoom-in-50 duration-300 delay-200">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2 animate-in fade-in duration-300 delay-300">
              Account Created Successfully!
            </h3>
            <p className="text-zinc-300 text-sm mb-3 animate-in fade-in duration-300 delay-400">
              Your account has been created and verified. You can now log in
              with your credentials.
            </p>
            <p className="text-xs text-zinc-400 animate-in fade-in duration-300 delay-500">
              Email verification completed ✓
            </p>
          </div>
        )}

        <Tabs
          defaultValue="login"
          className="w-full"
          onValueChange={(value) => {
            setActiveTab(value);
            clearErrors();
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {formErrors.some(
            (error) => error.field === "auth" || error.field === "rateLimit"
          ) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {
                  formErrors.find(
                    (error) =>
                      error.field === "auth" || error.field === "rateLimit"
                  )?.message
                }
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                      !validationState.email.isValid ? "border-red-500" : ""
                    }`}
                    value={loginData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={(e) => handleEmailChange(e.target.value)}
                    required
                    disabled={isLoading}
                    aria-invalid={!validationState.email.isValid}
                    aria-describedby={
                      !validationState.email.isValid ? "email-error" : undefined
                    }
                  />
                  {!validationState.email.isValid && (
                    <p className="text-sm text-red-500 mt-1" id="email-error">
                      {validationState.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                      !validationState.password.isValid ? "border-red-500" : ""
                    }`}
                    value={loginData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={(e) => handlePasswordChange(e.target.value)}
                    required
                    disabled={isLoading}
                    aria-invalid={!validationState.password.isValid}
                    aria-describedby={
                      !validationState.password.isValid
                        ? "password-error"
                        : undefined
                    }
                  />
                  {!validationState.password.isValid && (
                    <p
                      className="text-sm text-red-500 mt-1"
                      id="password-error"
                    >
                      {validationState.password.message}
                    </p>
                  )}
                </div>
              </div>
              {showCaptcha && (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={(token: string | null) => {
                        setCaptchaToken(token);
                        if (getFieldError("captcha")) clearErrors();
                      }}
                      theme="dark"
                    />
                  </div>
                  {getFieldError("captcha") && (
                    <p className="text-sm text-red-500 text-center">
                      {getFieldError("captcha")}
                    </p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
              <button
                type="button"
                className="w-full text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            {showVerificationMessage ? (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center space-y-4 animate-in slide-in-from-top-2 duration-500">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300 delay-200">
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-400 animate-in fade-in duration-300 delay-300">
                  Check Your Email
                </h3>
                <p className="text-zinc-300 animate-in fade-in duration-300 delay-400">
                  We've sent a verification link to{" "}
                  <span className="text-purple-400 font-medium">
                    {signupData.email}
                  </span>
                </p>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2 animate-in fade-in duration-300 delay-500">
                  <p className="text-sm text-zinc-300 font-medium">
                    Next Steps:
                  </p>
                  <ol className="text-xs text-zinc-400 space-y-1 text-left">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">1.</span>
                      Open your email app
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">2.</span>
                      Click the verification link
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">3.</span>
                      Return here to log in
                    </li>
                  </ol>
                </div>
                <p className="text-xs text-zinc-400 animate-in fade-in duration-300 delay-600">
                  Can't find the email? Check your spam folder.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowVerificationMessage(false)}
                  className="mt-4 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600 animate-in fade-in duration-300 delay-700"
                >
                  Back to Sign Up
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                        !validationState.fullName.isValid
                          ? "border-red-500"
                          : ""
                      }`}
                      value={signupData.fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      onBlur={(e) => handleFullNameChange(e.target.value)}
                      required
                      disabled={isLoading}
                      aria-invalid={!validationState.fullName.isValid}
                      aria-describedby={
                        !validationState.fullName.isValid
                          ? "fullName-error"
                          : undefined
                      }
                    />
                    {!validationState.fullName.isValid && (
                      <p
                        className="text-sm text-red-500 mt-1"
                        id="fullName-error"
                      >
                        {validationState.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                        !validationState.email.isValid ? "border-red-500" : ""
                      }`}
                      value={signupData.email}
                      onChange={(e) => handleEmailChange(e.target.value, false)}
                      onBlur={(e) => handleEmailChange(e.target.value, false)}
                      required
                      disabled={isLoading}
                      aria-invalid={!validationState.email.isValid}
                      aria-describedby={
                        !validationState.email.isValid
                          ? "email-error"
                          : undefined
                      }
                    />
                    {!validationState.email.isValid && (
                      <p className="text-sm text-red-500 mt-1" id="email-error">
                        {validationState.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                        !validationState.password.isValid
                          ? "border-red-500"
                          : ""
                      }`}
                      value={signupData.password}
                      onChange={(e) =>
                        handlePasswordChange(e.target.value, false)
                      }
                      onBlur={(e) =>
                        handlePasswordChange(e.target.value, false)
                      }
                      required
                      disabled={isLoading}
                      aria-invalid={!validationState.password.isValid}
                      aria-describedby={
                        !validationState.password.isValid
                          ? "password-error"
                          : undefined
                      }
                    />
                    {!validationState.password.isValid && (
                      <p
                        className="text-sm text-red-500 mt-1"
                        id="password-error"
                      >
                        {validationState.password.message}
                      </p>
                    )}
                    {signupData.password && !getFieldError("password") && (
                      <div className="space-y-1 mt-2">
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStrengthColor(
                              passwordStrength.score
                            )} transition-all duration-300`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span
                            className={`${getStrengthColor(
                              passwordStrength.score
                            )} text-transparent bg-clip-text`}
                          >
                            {getStrengthText(passwordStrength.score)}
                          </span>
                          {passwordStrength.feedback && (
                            <span className="text-zinc-400">
                              {passwordStrength.feedback}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
                        !validationState.confirmPassword.isValid
                          ? "border-red-500"
                          : ""
                      }`}
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        handleConfirmPasswordChange(e.target.value)
                      }
                      onBlur={(e) =>
                        handleConfirmPasswordChange(e.target.value)
                      }
                      required
                      disabled={isLoading}
                      aria-invalid={!validationState.confirmPassword.isValid}
                      aria-describedby={
                        !validationState.confirmPassword.isValid
                          ? "confirmPassword-error"
                          : undefined
                      }
                    />
                    {!validationState.confirmPassword.isValid && (
                      <p
                        className="text-sm text-red-500 mt-1"
                        id="confirmPassword-error"
                      >
                        {validationState.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                {showCaptcha && (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token: string | null) => {
                          setCaptchaToken(token);
                          if (getFieldError("captcha")) clearErrors();
                        }}
                        theme="dark"
                      />
                    </div>
                    {getFieldError("captcha") && (
                      <p className="text-sm text-red-500 text-center">
                        {getFieldError("captcha")}
                      </p>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  disabled={isLoading || isRateLimited}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-xs text-zinc-400 text-center">
                  You'll receive a verification email to complete your
                  registration
                </p>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={signupData.acceptTerms}
                      onChange={(e) => {
                        setSignupData((prev) => ({
                          ...prev,
                          acceptTerms: e.target.checked,
                        }));
                        if (getFieldError("acceptTerms")) clearErrors();
                      }}
                      className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-purple-500"
                      aria-invalid={!validationState.acceptTerms.isValid}
                      aria-describedby={
                        !validationState.acceptTerms.isValid
                          ? "terms-error"
                          : undefined
                      }
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm text-zinc-300"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
                      >
                        Terms of Service
                      </Link>
                    </label>
                  </div>
                  {getFieldError("acceptTerms") && (
                    <p className="text-sm text-red-500" id="terms-error">
                      {getFieldError("acceptTerms")}
                    </p>
                  )}
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-black text-zinc-400">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white transition-colors"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white transition-colors"
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
          >
            <FaApple className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
