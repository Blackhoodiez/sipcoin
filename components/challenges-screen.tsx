"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, CheckCircle2 } from "lucide-react";

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState("active");

  const activeChallengers = [
    {
      id: 1,
      title: "Visit 3 venues this week",
      progress: 1,
      total: 3,
      reward: 150,
      endDate: "2 days left",
      type: "venue",
    },
    {
      id: 2,
      title: "Try a signature cocktail",
      progress: 0,
      total: 1,
      reward: 75,
      endDate: "5 days left",
      type: "drink",
    },
    {
      id: 3,
      title: "Upload 5 receipts",
      progress: 2,
      total: 5,
      reward: 200,
      endDate: "Weekly",
      type: "upload",
    },
    {
      id: 4,
      title: "Visit Neon Lounge",
      progress: 0,
      total: 1,
      reward: 100,
      endDate: "Limited Time",
      type: "venue",
    },
  ];

  const completedChallenges = [
    {
      id: 5,
      title: "First Upload",
      progress: 1,
      total: 1,
      reward: 50,
      completedDate: "Yesterday",
      type: "upload",
    },
    {
      id: 6,
      title: "Create Account",
      progress: 1,
      total: 1,
      reward: 100,
      completedDate: "2 days ago",
      type: "account",
    },
  ];

  const leaderboard = [
    {
      id: 1,
      name: "JackD",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 3250,
      rank: 1,
    },
    {
      id: 2,
      name: "SophiaK",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 2980,
      rank: 2,
    },
    {
      id: 3,
      name: "Alex",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 1250,
      rank: 3,
    },
    {
      id: 4,
      name: "MikeT",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 950,
      rank: 4,
    },
    {
      id: 5,
      name: "JennyL",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 820,
      rank: 5,
    },
  ];

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "venue":
        return (
          <Target className="h-4 w-4 text-purple-400" aria-hidden="true" />
        );
      case "drink":
        return (
          <Trophy className="h-4 w-4 text-purple-400" aria-hidden="true" />
        );
      case "upload":
        return (
          <CheckCircle2
            className="h-4 w-4 text-purple-400"
            aria-hidden="true"
          />
        );
      default:
        return (
          <Trophy className="h-4 w-4 text-purple-400" aria-hidden="true" />
        );
    }
  };

  return (
    <div
      className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950"
      role="main"
    >
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Challenges & Leaderboard
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Complete challenges to earn SipCoins
        </p>
      </header>

      <Tabs
        defaultValue="active"
        className="w-full mb-6"
        onValueChange={setActiveTab}
        aria-label="Challenge categories"
      >
        <TabsList className="grid grid-cols-2 bg-zinc-900">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeChallengers.map((challenge) => (
            <Card
              key={challenge.id}
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getChallengeIcon(challenge.type)}
                    <h3 className="font-medium text-white">
                      {challenge.title}
                    </h3>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                    <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                    {challenge.endDate}
                  </Badge>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(challenge.progress / challenge.total) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">
                    {challenge.progress}/{challenge.total} completed
                  </span>
                  <span className="text-purple-300 font-medium">
                    +{challenge.reward} SipCoins
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getChallengeIcon(challenge.type)}
                    <h3 className="font-medium text-white">
                      {challenge.title}
                    </h3>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                    {challenge.completedDate}
                  </Badge>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Completed</span>
                  <span className="text-green-300 font-medium">
                    +{challenge.reward} SipCoins
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mb-4">
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 text-yellow-400 mr-2" aria-hidden="true" />
          <h2 className="text-lg font-bold text-white">Top Users This Week</h2>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between py-3 transition-colors hover:bg-zinc-800/50 ${
                  index !== leaderboard.length - 1
                    ? "border-b border-zinc-800"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                        ? "bg-zinc-400 text-black"
                        : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-zinc-700 text-white"
                    }`}
                    aria-label={`Rank ${index + 1}`}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium text-white">{user.name}</div>
                </div>
                <div className="font-bold text-purple-400">
                  {user.points.toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
