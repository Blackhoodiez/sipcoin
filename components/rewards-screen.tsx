"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Gift, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RewardsScreen() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);

  const rewards = [
    {
      id: 1,
      title: "Free Cocktail",
      venue: "Neon Lounge",
      points: 250,
      image: "/placeholder.svg?height=100&width=100",
      type: "drink",
      featured: true,
      location: "Downtown",
      expiresIn: "7 days",
    },
    {
      id: 2,
      title: "VIP Entry (Skip the Line)",
      venue: "Pulse Nightclub",
      points: 500,
      image: "/placeholder.svg?height=100&width=100",
      type: "vip",
      location: "Westside",
      expiresIn: "3 days",
    },
    {
      id: 3,
      title: "SipCoin T-Shirt",
      venue: "Online Store",
      points: 750,
      image: "/placeholder.svg?height=100&width=100",
      type: "merch",
      location: "Online",
      expiresIn: "30 days",
    },
    {
      id: 4,
      title: "2-for-1 Happy Hour",
      venue: "Skybar",
      points: 350,
      image: "/placeholder.svg?height=100&width=100",
      type: "drink",
      location: "Uptown",
      expiresIn: "5 days",
    },
    {
      id: 5,
      title: "Private Booth Reservation",
      venue: "The Speakeasy",
      points: 1000,
      image: "/placeholder.svg?height=100&width=100",
      type: "vip",
      location: "Downtown",
      expiresIn: "2 days",
    },
  ];

  const filteredRewards = rewards.filter((reward) => {
    const matchesFilter = filter === "all" || reward.type === filter;
    const matchesSearch =
      reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRedeem = async (rewardId: number) => {
    setIsRedeeming(rewardId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRedeeming(null);
    // TODO: Implement actual redemption logic
  };

  return (
    <div
      className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950"
      role="main"
    >
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Redeem your SipCoins for exclusive rewards
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg">
          <Gift className="h-5 w-5 text-purple-400" aria-hidden="true" />
          <div className="text-purple-400 font-bold">1,250</div>
          <div className="text-xs text-zinc-400">SipCoins</div>
        </div>
      </header>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4"
          aria-hidden="true"
        />
        <Input
          placeholder="Search rewards..."
          className="pl-10 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500/50 transition-colors"
          aria-label="Search rewards"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs
        defaultValue="all"
        className="w-full mb-6"
        onValueChange={setFilter}
        aria-label="Filter rewards by category"
      >
        <TabsList className="grid grid-cols-4 bg-zinc-900">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="drink"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Drinks
          </TabsTrigger>
          <TabsTrigger
            value="vip"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            VIP
          </TabsTrigger>
          <TabsTrigger
            value="merch"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Merch
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredRewards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">
              No rewards found matching your criteria
            </p>
          </div>
        ) : (
          filteredRewards.map((reward) => (
            <Card
              key={reward.id}
              className={`bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 hover:shadow-lg ${
                reward.featured ? "border-purple-500/50" : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 bg-zinc-800 flex-shrink-0 relative">
                    <img
                      src={reward.image || "/placeholder.svg"}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {reward.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px]">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          {reward.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          <span>{reward.venue}</span>
                          <span className="text-zinc-500">•</span>
                          <span>{reward.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>Expires in {reward.expiresIn}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-400 mb-1">
                          {reward.points}
                        </div>
                        <div className="text-xs text-zinc-300">SipCoins</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          reward.points > 1250 || isRedeeming === reward.id
                        }
                        onClick={() => handleRedeem(reward.id)}
                        aria-label={`Redeem ${reward.title} for ${reward.points} SipCoins`}
                      >
                        {isRedeeming === reward.id ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                        ) : reward.points > 1250 ? (
                          "Not enough points"
                        ) : (
                          "Redeem"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
