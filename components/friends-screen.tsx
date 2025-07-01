"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  UserPlus,
  MessageSquare,
  Users,
  Trophy,
  Send,
  Plus,
  X,
  Check,
  ClockIcon,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FriendsScreen() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const friends = [
    {
      id: "1",
      name: "Sarah Kim",
      username: "@sarahk",
      avatar: "/placeholder.svg?height=50&width=50",
      status: "online",
      lastActive: "Now",
      points: 2450,
      lastMessage: "Are you going to Neon Lounge tonight?",
    },
    {
      id: "2",
      name: "Mike Johnson",
      username: "@mikej",
      avatar: "/placeholder.svg?height=50&width=50",
      status: "offline",
      lastActive: "2h ago",
      points: 1850,
      lastMessage: "I just earned 200 SipCoins!",
    },
    {
      id: "3",
      name: "Jessica Taylor",
      username: "@jesst",
      avatar: "/placeholder.svg?height=50&width=50",
      status: "online",
      lastActive: "Now",
      points: 3200,
      lastMessage: "Check out this new challenge",
    },
  ];

  const suggestions = [
    {
      id: "4",
      name: "David Wilson",
      username: "@davidw",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 3,
      points: 1650,
    },
    {
      id: "5",
      name: "Emma Roberts",
      username: "@emmar",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 2,
      points: 2100,
    },
    {
      id: "6",
      name: "Chris Lee",
      username: "@chrisl",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 1,
      points: 980,
    },
  ];

  const pendingRequests = [
    {
      id: "7",
      name: "Olivia Martinez",
      username: "@oliviam",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 4,
      points: 1750,
    },
    {
      id: "8",
      name: "Ryan Garcia",
      username: "@ryang",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 2,
      points: 2300,
    },
  ];

  const messages = [
    {
      id: "msg1",
      friendId: "1",
      messages: [
        {
          id: "1-1",
          sender: "friend",
          text: "Hey! Are you going to Neon Lounge tonight?",
          time: "7:30 PM",
        },
        {
          id: "1-2",
          sender: "me",
          text: "I'm thinking about it! What time are you going?",
          time: "7:32 PM",
        },
        {
          id: "1-3",
          sender: "friend",
          text: "Around 9pm. They have a new signature cocktail!",
          time: "7:33 PM",
        },
        {
          id: "1-4",
          sender: "me",
          text: "Sounds good! We can earn SipCoins for the 'Try a signature cocktail' challenge",
          time: "7:35 PM",
        },
      ],
    },
    {
      id: "msg2",
      friendId: "2",
      messages: [
        {
          id: "2-1",
          sender: "friend",
          text: "I just earned 200 SipCoins!",
          time: "5:15 PM",
        },
        {
          id: "2-2",
          sender: "me",
          text: "Nice! How did you get so many?",
          time: "5:20 PM",
        },
        {
          id: "2-3",
          sender: "friend",
          text: "Completed the weekly challenge at Skybar",
          time: "5:22 PM",
        },
      ],
    },
    {
      id: "msg3",
      friendId: "3",
      messages: [
        {
          id: "3-1",
          sender: "friend",
          text: "Check out this new challenge",
          time: "Yesterday",
        },
        {
          id: "3-2",
          sender: "friend",
          text: "Visit 3 venues this weekend for 300 SipCoins",
          time: "Yesterday",
        },
        {
          id: "3-3",
          sender: "me",
          text: "That sounds fun! Want to team up?",
          time: "Yesterday",
        },
        {
          id: "3-4",
          sender: "friend",
          text: "Definitely! Let's start at The Speakeasy",
          time: "Yesterday",
        },
      ],
    },
  ];

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setIsSending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In a real app, you would send the message to the backend
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleFriendRequest = async (
    action: "accept" | "decline",
    userId: string
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In a real app, you would handle the friend request
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex flex-col p-4 pb-20 min-h-screen bg-zinc-950"
      role="main"
      aria-label="Friends and Chat"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Friends</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Connect and chat with friends
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-colors"
          aria-label="Add new friend"
        >
          <UserPlus className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {activeChat ? (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setActiveChat(null)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4 mr-2" aria-hidden="true" />
              Close
            </Button>
            <div className="flex items-center">
              <span className="text-white font-medium">
                {friends.find((f) => f.id === activeChat)?.name}
              </span>
              <div
                className={`ml-2 w-2 h-2 rounded-full ${
                  friends.find((f) => f.id === activeChat)?.status === "online"
                    ? "bg-green-500"
                    : "bg-zinc-500"
                }`}
                aria-label={`Status: ${
                  friends.find((f) => f.id === activeChat)?.status
                }`}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-zinc-800 transition-colors"
              aria-label="View friend's achievements"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 flex-1 mb-4 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 h-full">
              <ScrollArea className="h-[calc(100%-1rem)] pr-4">
                <div className="space-y-4">
                  {messages
                    .find((m) => m.friendId === activeChat)
                    ?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender === "me"
                              ? "bg-purple-500 text-white"
                              : "bg-zinc-800 text-white"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "me"
                                ? "text-purple-200"
                                : "text-zinc-400"
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 transition-colors"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              aria-label="Message input"
              disabled={isSending}
            />
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors"
              size="icon"
              onClick={handleSendMessage}
              aria-label="Send message"
              disabled={isSending || message.trim() === ""}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4"
              aria-hidden="true"
            />
            <Input
              placeholder="Search friends..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search friends"
            />
          </div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid grid-cols-3 bg-zinc-900">
              <TabsTrigger
                value="friends"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
              >
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="suggestions"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
              >
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
              >
                <ClockIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Pending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4 space-y-4">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>No friends found matching your search.</p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage
                              src={friend.avatar || "/placeholder.svg"}
                              alt={friend.name}
                              loading="lazy"
                            />
                            <AvatarFallback>
                              {friend.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute bottom-0 right-2 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                              friend.status === "online"
                                ? "bg-green-500"
                                : "bg-zinc-500"
                            }`}
                            aria-label={`Status: ${friend.status}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white">
                                {friend.name}
                              </h3>
                              <p className="text-xs text-zinc-400">
                                {friend.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-zinc-400">
                                {friend.lastActive}
                              </div>
                              <div className="text-xs text-purple-400">
                                {friend.points} SipCoins
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-300 mt-1 line-clamp-1">
                            {friend.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 mr-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-colors"
                          onClick={() => setActiveChat(friend.id)}
                          aria-label={`Message ${friend.name}`}
                        >
                          <MessageSquare
                            className="h-4 w-4 mr-2"
                            aria-hidden="true"
                          />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-colors"
                          aria-label={`Challenge ${friend.name}`}
                        >
                          <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
                          Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4 space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>No friend suggestions available.</p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage
                            src={suggestion.avatar || "/placeholder.svg"}
                            alt={suggestion.name}
                            loading="lazy"
                          />
                          <AvatarFallback>
                            {suggestion.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white">
                                {suggestion.name}
                              </h3>
                              <p className="text-xs text-zinc-400">
                                {suggestion.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-purple-400">
                                {suggestion.points} SipCoins
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-300 mt-1">
                            {suggestion.mutualFriends} mutual{" "}
                            {suggestion.mutualFriends === 1
                              ? "friend"
                              : "friends"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-colors"
                          aria-label={`Dismiss ${suggestion.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600 text-white border-purple-600 transition-colors"
                          aria-label={`Add ${suggestion.name} as friend`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Add Friend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4 space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>No pending friend requests.</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage
                            src={request.avatar || "/placeholder.svg"}
                            alt={request.name}
                            loading="lazy"
                          />
                          <AvatarFallback>
                            {request.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white">
                                {request.name}
                              </h3>
                              <p className="text-xs text-zinc-400">
                                {request.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-purple-400">
                                {request.points} SipCoins
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-300 mt-1">
                            {request.mutualFriends} mutual{" "}
                            {request.mutualFriends === 1 ? "friend" : "friends"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-colors"
                          onClick={() =>
                            handleFriendRequest("decline", request.id)
                          }
                          disabled={isLoading}
                          aria-label={`Decline ${request.name}'s friend request`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Decline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white border-green-600 transition-colors"
                          onClick={() =>
                            handleFriendRequest("accept", request.id)
                          }
                          disabled={isLoading}
                          aria-label={`Accept ${request.name}'s friend request`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
