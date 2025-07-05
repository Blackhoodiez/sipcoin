"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplashScreen from "@/components/splash-screen";
import LoginScreen from "@/components/login-screen";
import HomeScreen from "@/components/home-screen";
import UploadScreen from "@/components/upload-screen";
import RewardsScreen from "@/components/rewards-screen";
import ChallengesScreen from "@/components/challenges-screen";
import ProfileScreen from "@/components/profile-screen";
import FriendsScreen from "@/components/friends-screen";
import { Home, Gift, Upload, Trophy, User, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function SipCoinApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate app loading sequence
  useEffect(() => {
    if (mounted && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mounted, showSplash]);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading state while auth is loading. Can be a simple div or a dedicated spinner.
  if (loading) {
    return <div>Loading authentication...</div>; // You can replace this with a better loading indicator
  }

  // If not loading and no user is present, show the LoginScreen
  if (!user) {
    // Pass a no-op or relevant handler for onLogin if needed
    return <LoginScreen onLogin={() => {}} />;
  }

  // If not loading and a user is present, show the main application content
  return <MainAppContent />;
}

// Create a new component for the main application content that was previously inline
function MainAppContent() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-16">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "upload" && <UploadScreen />}
        {activeTab === "rewards" && <RewardsScreen />}
        {activeTab === "challenges" && <ChallengesScreen />}
        {activeTab === "friends" && <FriendsScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 shadow-lg z-50 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full h-16 rounded-none bg-zinc-950">
            <TabsTrigger value="home">
              <Home size={20} />
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift size={20} />
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload size={20} />
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Trophy size={20} />
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users size={20} />
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User size={20} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
