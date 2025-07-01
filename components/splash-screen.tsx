"use client";

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 blur-xl opacity-70 animate-pulse"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-black rounded-full border-2 border-purple-500">
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            SC
          </span>
        </div>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
        SipCoin
      </h1>
      <p className="text-zinc-300 text-sm">Drink. Earn. Repeat.</p>
    </div>
  );
}
