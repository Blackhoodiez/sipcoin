"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  LogOut,
  User,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  Gift,
  Calendar,
  ChevronRight,
  Loader2,
  Crown,
  Star,
  TrendingUp,
  MapPin,
  Receipt,
  Award,
  Zap,
  Camera,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import ProfileEditModal from "@/components/profile-edit-modal";
import { ProfileSkeleton, StatsSkeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface ProfileData {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  date_of_birth: string | null;
  gender: string;
  location: string;
  interests: string;
  avatar_url: string | null;
  is_profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalSipCoins: number;
  totalVenues: number;
  totalReceipts: number;
  averagePerReceipt: number;
  thisMonthSipCoins: number;
  thisMonthReceipts: number;
  topVenue: string;
}

interface ReceiptData {
  sipcoins_earned: number;
  merchant_name: string;
  created_at: string;
}

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("redemptions");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSipCoins: 0,
    totalVenues: 0,
    totalReceipts: 0,
    averagePerReceipt: 0,
    thisMonthSipCoins: 0,
    thisMonthReceipts: 0,
    topVenue: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        console.log("Loading profile for user:", user.id);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          setError("Failed to load profile data");
          toast.error("Failed to load profile data");
          return;
        }

        console.log("Profile loaded successfully:", profile);
        // Display profile immediately
        const cleanUrl = profile.avatar_url;
        setProfileData({ ...profile, avatar_url: cleanUrl });
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data");
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Load user stats
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return;

      try {
        setIsLoadingStats(true);

        // Get total SipCoins earned
        const { data: receipts, error: receiptsError } = (await supabase
          .from("receipts")
          .select("sipcoins_earned, merchant_name, created_at")
          .eq("user_id", user.id)
          .eq("status", "processed")) as {
          data: ReceiptData[] | null;
          error: any;
        };

        if (receiptsError) {
          console.error("Error loading receipts:", receiptsError);
          return;
        }

        const totalSipCoins =
          receipts?.reduce(
            (sum, receipt) => sum + (receipt.sipcoins_earned || 0),
            0
          ) || 0;
        const uniqueVenues = new Set(
          receipts?.map((r) => r.merchant_name).filter(Boolean) || []
        ).size;
        const totalReceipts = receipts?.length || 0;

        // Calculate average per receipt
        const averagePerReceipt =
          totalReceipts > 0 ? totalSipCoins / totalReceipts : 0;

        // Calculate this month's stats
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthReceipts =
          receipts?.filter((receipt) => {
            const receiptDate = new Date(receipt.created_at);
            return receiptDate >= thisMonth;
          }) || [];
        const thisMonthSipCoins = thisMonthReceipts.reduce(
          (sum, receipt) => sum + (receipt.sipcoins_earned || 0),
          0
        );

        // Find top venue (most visited)
        const venueCounts =
          receipts?.reduce((acc, receipt) => {
            if (receipt.merchant_name) {
              acc[receipt.merchant_name] =
                (acc[receipt.merchant_name] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {};

        const topVenue =
          Object.keys(venueCounts).length > 0
            ? Object.entries(venueCounts).sort(([, a], [, b]) => b - a)[0][0]
            : "";

        setUserStats({
          totalSipCoins,
          totalVenues: uniqueVenues,
          totalReceipts,
          averagePerReceipt,
          thisMonthSipCoins,
          thisMonthReceipts: thisMonthReceipts.length,
          topVenue,
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadUserStats();
  }, [user]);

  // Generate initials from full name
  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle avatar image error
  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarLoading(false);
  };

  // Handle avatar image load
  const handleAvatarLoad = () => {
    setAvatarLoading(false);
    setAvatarError(false);
  };

  // Reset avatar states when profile data changes
  useEffect(() => {
    setAvatarError(false);
    // Set a timeout to automatically stop loading after 3 seconds
    // This prevents infinite loading if the onLoad event doesn't fire
    if (profileData?.avatar_url) {
      setAvatarLoading(true);
      const timeout = setTimeout(() => {
        setAvatarLoading(false);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setAvatarLoading(false);
    }
  }, [profileData?.avatar_url]);

  // Refresh profile data after edit
  const handleProfileSave = () => {
    console.log("Refreshing profile data...");

    // Reload profile data
    const loadProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          toast.error("Failed to refresh profile data");
          return;
        }

        console.log("Profile data refreshed:", profile);
        // Display profile immediately
        const cleanUrl = profile.avatar_url;
        setProfileData({ ...profile, avatar_url: cleanUrl });
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to refresh profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Get member tier based on SipCoins
  const getMemberTier = (sipCoins: number) => {
    if (sipCoins >= 5000)
      return {
        tier: "Diamond",
        color: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300",
        nextTier: null,
        progress: 100,
      };
    if (sipCoins >= 2500)
      return {
        tier: "Platinum",
        color:
          "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300",
        nextTier: "Diamond",
        progress: Math.min(((sipCoins - 2500) / (5000 - 2500)) * 100, 100),
      };
    if (sipCoins >= 1000)
      return {
        tier: "Gold",
        color:
          "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300",
        nextTier: "Platinum",
        progress: Math.min(((sipCoins - 1000) / (2500 - 1000)) * 100, 100),
      };
    if (sipCoins >= 500)
      return {
        tier: "Silver",
        color:
          "bg-gradient-to-r from-gray-400/20 to-slate-400/20 text-gray-300",
        nextTier: "Gold",
        progress: Math.min(((sipCoins - 500) / (1000 - 500)) * 100, 100),
      };
    return {
      tier: "Bronze",
      color:
        "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300",
      nextTier: "Silver",
      progress: Math.min((sipCoins / 500) * 100, 100),
    };
  };

  const redemptions = [
    {
      id: 1,
      title: "Free Cocktail",
      venue: "Neon Lounge",
      date: "May 15, 2025",
      status: "Used",
      image: "/placeholder.svg?height=60&width=60",
      points: 250,
    },
    {
      id: 2,
      title: "VIP Entry",
      venue: "Pulse Nightclub",
      date: "May 10, 2025",
      status: "Expired",
      image: "/placeholder.svg?height=60&width=60",
      points: 500,
    },
    {
      id: 3,
      title: "2-for-1 Happy Hour",
      venue: "Skybar",
      date: "May 5, 2025",
      status: "Active",
      image: "/placeholder.svg?height=60&width=60",
      points: 350,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to Load Profile
          </h3>
          <p className="text-zinc-400 text-sm mb-4">{error}</p>
          <Button
            variant="outline"
            className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const memberTier = getMemberTier(userStats.totalSipCoins);

  return (
    <div
      className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950"
      role="main"
    >
      <div className="animate-fade-in-down">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Profile</h1>
            <p className="text-sm text-zinc-400 mt-1 animate-fade-in-up">
              Manage your account and preferences
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-zinc-800 hover-lift-sm active-scale-sm shadow-soft-dark"
            aria-label="Edit Profile"
            onClick={() => setIsEditModalOpen(true)}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6 hover:border-zinc-700 transition-all duration-300 hover-lift shadow-soft-dark animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Avatar
              className="h-16 w-16 mr-4 border-2 border-purple-500 relative group cursor-pointer hover:border-purple-400 transition-all duration-300 hover-lift-sm active-scale-sm shadow-glow"
              onClick={() => setIsEditModalOpen(true)}
            >
              <AvatarImage
                src={
                  profileData?.avatar_url && !avatarError
                    ? profileData.avatar_url
                    : undefined
                }
                alt={profileData?.full_name || "User"}
                onError={handleAvatarError}
                onLoad={handleAvatarLoad}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 font-semibold text-lg animate-pulse-slow">
                {avatarLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  getInitials(profileData?.full_name || "")
                )}
              </AvatarFallback>

              {/* Avatar upload indicator */}
              {!profileData?.avatar_url && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      className="w-6 h-6 text-white animate-bounce-in"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-xs text-white font-medium">
                      Add Photo
                    </span>
                  </div>
                </div>
              )}
            </Avatar>
            <div className="animate-fade-in-left">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>{profileData?.full_name || "Complete Your Profile"}</span>
                {memberTier.tier === "VIP" && (
                  <Crown className="h-5 w-5 text-yellow-400 animate-glow" />
                )}
                {memberTier.tier === "Premium" && (
                  <Star className="h-5 w-5 text-purple-400 animate-pulse-slow" />
                )}
              </h2>
              <p className="text-zinc-300 flex items-center space-x-1">
                <span>
                  {profileData?.username
                    ? `@${profileData.username}`
                    : "No username set"}
                </span>
              </p>
              <div className="flex items-center mt-1 flex-wrap gap-2">
                <Badge className={`${memberTier.color} animate-scale-in`}>
                  {memberTier.tier === "VIP" && (
                    <Crown className="h-3 w-3 mr-1" />
                  )}
                  {memberTier.tier === "Premium" && (
                    <Star className="h-3 w-3 mr-1" />
                  )}
                  {memberTier.tier} Member
                </Badge>
                {!profileData?.is_profile_completed && (
                  <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 animate-bounce-in">
                    Profile Incomplete
                  </Badge>
                )}
                <span className="text-sm text-zinc-300 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Since{" "}
                  {profileData?.created_at
                    ? formatDate(profileData.created_at)
                    : "Recently"}
                </span>
              </div>

              {/* Tier Progress */}
              {memberTier.nextTier && (
                <div className="mt-2 animate-fade-in-up">
                  <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Progress to {memberTier.nextTier}
                    </span>
                    <span className="font-medium">
                      {Math.round(memberTier.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out shadow-glow"
                      style={{ width: `${memberTier.progress}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            {isLoadingStats ? (
              <StatsSkeleton />
            ) : (
              <>
                <div
                  className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all duration-300 hover-lift-sm shadow-soft-dark animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-purple-400 mr-2" />
                    <div className="text-xl font-bold text-purple-400">
                      {userStats.totalSipCoins.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300 font-medium">
                    Total SipCoins
                  </div>
                  {userStats.thisMonthSipCoins > 0 && (
                    <div className="text-xs text-green-400 mt-1 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {userStats.thisMonthSipCoins} this month
                    </div>
                  )}
                </div>
                <div
                  className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all duration-300 hover-lift-sm shadow-soft-dark animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                    <div className="text-xl font-bold text-white">
                      {userStats.totalVenues}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300 font-medium">
                    Venues Visited
                  </div>
                  {userStats.topVenue && (
                    <div
                      className="text-xs text-zinc-400 mt-1 truncate flex items-center justify-center"
                      title={userStats.topVenue}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Top: {userStats.topVenue}
                    </div>
                  )}
                </div>
                <div
                  className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all duration-300 hover-lift-sm shadow-soft-dark animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Receipt className="h-5 w-5 text-green-400 mr-2" />
                    <div className="text-xl font-bold text-white">
                      {userStats.totalReceipts}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300 font-medium">
                    Receipts
                  </div>
                  {userStats.averagePerReceipt > 0 && (
                    <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center">
                      <Award className="h-3 w-3 mr-1" />~
                      {Math.round(userStats.averagePerReceipt)} avg
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Detailed Stats Section */}
          {!isLoadingStats && userStats.totalReceipts > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">This Month:</span>
                  <span className="text-white font-medium">
                    {userStats.thisMonthReceipts} receipts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Average per Receipt:</span>
                  <span className="text-white font-medium">
                    {Math.round(userStats.averagePerReceipt)} SipCoins
                  </span>
                </div>
                {userStats.topVenue && (
                  <div className="flex justify-between items-center col-span-2">
                    <span className="text-zinc-400">Favorite Venue:</span>
                    <span
                      className="text-white font-medium truncate ml-2"
                      title={userStats.topVenue}
                    >
                      {userStats.topVenue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!profileData?.is_profile_completed && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-300">
                    Complete your profile to unlock all features
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Add your bio, location, and interests
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs
        defaultValue="redemptions"
        className="w-full mb-6"
        onValueChange={setActiveTab}
        aria-label="Profile sections"
      >
        <TabsList className="grid grid-cols-2 bg-zinc-900">
          <TabsTrigger
            value="redemptions"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            My Redemptions
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="redemptions" className="mt-4 space-y-4">
          {redemptions.length > 0 ? (
            redemptions.map((redemption) => (
              <Card
                key={redemption.id}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="flex">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg flex-shrink-0 mr-3">
                      <img
                        src={redemption.image || "/placeholder.svg"}
                        alt={redemption.title}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">
                            {redemption.title}
                          </h3>
                          <p className="text-sm text-zinc-300">
                            {redemption.venue}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-zinc-400">
                              {redemption.date}
                            </p>
                            <span className="text-xs text-zinc-500">•</span>
                            <p className="text-xs text-purple-300">
                              {redemption.points} SipCoins
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`
                          ${
                            redemption.status === "Active"
                              ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                              : redemption.status === "Used"
                              ? "bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/30"
                              : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          }
                        `}
                        >
                          {redemption.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Gift className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Redemptions Yet
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Start earning SipCoins by uploading receipts to unlock amazing
                  rewards!
                </p>
                <Button
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  onClick={() => {
                    router.push("/?tab=upload");
                  }}
                >
                  Upload Receipts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800 mb-4 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center">
                <User
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Account Settings</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-zinc-800"
                  aria-label="Edit account settings"
                >
                  Edit
                </Button>
              </div>

              <div className="flex items-center">
                <Bell
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Notifications</div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  aria-label="Toggle notifications"
                />
              </div>

              <div className="flex items-center">
                <CreditCard
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Payment Methods</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-zinc-800"
                  aria-label="Add payment method"
                >
                  Add
                </Button>
              </div>

              <div className="flex items-center">
                <Shield
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Privacy</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-zinc-800"
                  aria-label="View privacy settings"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 mb-4 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center">
                <HelpCircle
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Help & Support</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-zinc-800"
                  aria-label="Contact support"
                >
                  Contact
                </Button>
              </div>

              <div className="flex items-center">
                <Gift
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">Invite Friends</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-zinc-800"
                  aria-label="Share invite link"
                >
                  Share
                </Button>
              </div>

              <div className="flex items-center">
                <Calendar
                  className="h-5 w-5 mr-3 text-zinc-300"
                  aria-hidden="true"
                />
                <div className="flex-1 text-white">App Version</div>
                <div className="text-sm text-zinc-300">v1.0.5</div>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-red-300 transition-colors"
            onClick={signOut}
            aria-label="Log out of account"
          >
            <User className="h-4 w-4 mr-2" aria-hidden="true" />
            Log Out
          </Button>
        </TabsContent>
      </Tabs>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
        initialProfile={profileData}
      />
    </div>
  );
}
