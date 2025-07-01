"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import ProfileCompletionForm from "@/components/profile-completion-form";
import { useEffect } from "react";
import SipCoinLogo from "@/components/sipcoin-logo";

export default function ProfileCompletionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔧 ProfileCompletionPage: User state:", user?.email ?? "none");
    console.log("🔧 ProfileCompletionPage: Loading state:", loading);

    // If not loading and no user, redirect to login
    if (!loading && !user) {
      console.log("❌ No user found, redirecting to login");
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // Show loading state with SipCoin branding
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 blur-xl opacity-70 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-black rounded-full border-2 border-purple-500">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              SC
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Loading Profile
        </h1>
        <p className="text-zinc-300 text-sm text-center">
          Please wait while we verify your authentication
        </p>
        <p className="text-zinc-500 text-xs mt-2">
          {user?.email ?? "Detecting user..."}
        </p>
      </div>
    );
  }

  // If no user after loading, show redirect state
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-orange-500 blur-xl opacity-70 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-black rounded-full border-2 border-red-500">
            <span className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              !
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Authentication Required
        </h1>
        <p className="text-zinc-300 text-sm text-center">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-zinc-800">
        <SipCoinLogo />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 pb-20">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              Complete Your Profile
            </h1>
            <p className="text-zinc-300 text-sm">
              Tell us a bit more about yourself to get started with SipCoin
            </p>
          </div>

          <ProfileCompletionForm />
        </div>
      </main>
    </div>
  );
}
