"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Camera, MapPin, Star, Bell } from "lucide-react";
import SipCoinLogo from "./sipcoin-logo";

export default function HomeScreen() {
  const challenges = [
    {
      id: 1,
      title: "Visit 3 venues this week",
      progress: 1,
      total: 3,
      reward: "150 SipCoins",
    },
    {
      id: 2,
      title: "Try a signature cocktail",
      progress: 0,
      total: 1,
      reward: "75 SipCoins",
    },
    {
      id: 3,
      title: "Upload 5 receipts",
      progress: 2,
      total: 5,
      reward: "200 SipCoins",
    },
  ];

  const venues = [
    {
      id: 1,
      name: "Neon Lounge",
      city: "Downtown",
      image: "/placeholder.svg?height=80&width=80",
      distance: "0.5 mi",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Skybar",
      city: "Midtown",
      image: "/placeholder.svg?height=80&width=80",
      distance: "1.2 mi",
      rating: 4.6,
    },
    {
      id: 3,
      name: "The Speakeasy",
      city: "Historic District",
      image: "/placeholder.svg?height=80&width=80",
      distance: "0.8 mi",
      rating: 4.9,
    },
    {
      id: 4,
      name: "Pulse Nightclub",
      city: "Arts District",
      image: "/placeholder.svg?height=80&width=80",
      distance: "1.5 mi",
      rating: 4.7,
    },
  ];

  return (
    <div className="flex flex-col p-4 pb-20" role="main">
      <header className="flex justify-between items-center mb-6">
        <SipCoinLogo />
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-white relative"
            aria-label="Notifications"
            aria-describedby="notification-count"
          >
            <Bell className="h-5 w-5" />
            <div
              id="notification-count"
              className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
              aria-label="3 unread notifications"
            >
              <span className="text-[10px] text-white font-bold">3</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="User profile"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div
              className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full"
              aria-label="Online status"
            />
          </Button>
        </div>
      </header>

      <section className="mb-4" aria-label="Balance">
        <p className="text-zinc-300">
          You have <span className="text-purple-400 font-bold">1,250</span>{" "}
          SipCoins
        </p>
      </section>

      <Button
        className="w-full py-6 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Upload receipt"
      >
        <Camera className="mr-2 h-5 w-5" />
        Upload Receipt
      </Button>

      <section className="mb-6" aria-label="Active Challenges">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Active Challenges</h2>
          <Button
            variant="link"
            className="text-purple-400 p-0 hover:text-purple-300 transition-colors"
            aria-label="View all challenges"
          >
            View All
          </Button>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="min-w-[280px] bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-white mb-2">
                    {challenge.title}
                  </h3>
                  <div
                    className="w-full bg-zinc-800 rounded-full h-2 mb-2"
                    role="progressbar"
                    aria-valuenow={challenge.progress}
                    aria-valuemin={0}
                    aria-valuemax={challenge.total}
                  >
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${
                          (challenge.progress / challenge.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">
                      {challenge.progress}/{challenge.total} completed
                    </span>
                    <span className="text-purple-300">{challenge.reward}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section aria-label="Nearby Venues">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Nearby Venues</h2>
          <Button
            variant="link"
            className="text-purple-400 p-0 hover:text-purple-300 transition-colors"
            aria-label="View venues on map"
          >
            See Map
          </Button>
        </div>

        <div className="space-y-3">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="flex items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${venue.name} in ${venue.city}, ${venue.distance} away, rated ${venue.rating} stars`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                <img
                  src={venue.image || "/placeholder.svg"}
                  alt={`${venue.name} venue`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{venue.name}</h3>
                <div className="flex items-center text-xs text-zinc-300 mb-1">
                  <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span>{venue.city}</span>
                  <span className="mx-2" aria-hidden="true">
                    •
                  </span>
                  <span>{venue.distance}</span>
                </div>
                <div className="flex items-center">
                  <Star
                    className="h-3 w-3 text-yellow-400 mr-1"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-zinc-300">{venue.rating}</span>
                  <Badge
                    className="ml-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px]"
                    aria-label="Partner venue"
                  >
                    Partner
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
