"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ValidationState {
  isValid: boolean;
  message: string;
}

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const validation = validateEmail(value);
    setValidationState(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setValidationState(validation);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            We've sent password reset instructions to {email}. Please check your
            inbox and follow the link to reset your password.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
            onBack();
          }}
        >
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-zinc-400 text-sm">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            className={`bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors ${
              !validationState.isValid ? "border-red-500" : ""
            }`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={(e) => handleEmailChange(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!validationState.isValid}
            aria-describedby={
              !validationState.isValid ? "email-error" : undefined
            }
          />
          {!validationState.isValid && (
            <p className="text-sm text-red-500 mt-1" id="email-error">
              {validationState.message}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Instructions...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-zinc-400 hover:text-zinc-300"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
}
