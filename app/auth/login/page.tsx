"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginScreen from "@/components/login-screen";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);

  // This function is called after a successful login attempt in LoginScreen
  // The middleware should handle redirection based on the new session
  // No client-side redirect needed here.
  const handleLogin = () => {
    console.log("Login successful, middleware should handle redirect.");
  };

  return <LoginScreen onLogin={handleLogin} />;
}
