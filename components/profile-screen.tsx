"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("redemptions");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  return (
    <div
      className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950"
      role="main"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your account and preferences
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-zinc-800"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6 hover:border-zinc-700 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4 border-2 border-purple-500">
              <AvatarImage
                src="/placeholder.svg?height=64&width=64"
                alt="Alex Johnson"
              />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-white">Alex Johnson</h2>
              <p className="text-zinc-300">@alexj</p>
              <div className="flex items-center mt-1">
                <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 mr-2">
                  Silver Member
                </Badge>
                <span className="text-sm text-zinc-300">Since Oct 2024</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div className="bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors">
              <div className="text-xl font-bold text-purple-400">1,250</div>
              <div className="text-xs text-zinc-300">SipCoins</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors">
              <div className="text-xl font-bold text-white">12</div>
              <div className="text-xs text-zinc-300">Venues</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors">
              <div className="text-xl font-bold text-white">8</div>
              <div className="text-xs text-zinc-300">Rewards</div>
            </div>
          </div>
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
          {redemptions.map((redemption) => (
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
          ))}
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
            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
            Log Out
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
