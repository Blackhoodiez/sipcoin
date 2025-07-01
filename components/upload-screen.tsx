"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Check, ArrowRight, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";

export default function UploadScreen() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user } = useAuth();

  // Simulate progress for demo purposes
  const simulateProgress = () => {
    setIsProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  // Handle file selection (gallery or camera)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStep(2); // Move to processing step
    }
  };

  // Trigger file input for gallery
  const handleGalleryClick = () => {
    fileInputRef.current?.setAttribute("capture", ""); // Remove capture attribute
    fileInputRef.current?.click();
  };

  // Trigger file input for camera
  const handleCameraClick = () => {
    fileInputRef.current?.setAttribute("capture", "environment"); // Use camera
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col p-4 pb-20" role="main">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Upload Receipt</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          aria-label="Close upload screen"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <nav aria-label="Upload progress" className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 1 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label={step > 1 ? "Step 1 completed" : "Step 1"}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div
              className={`h-1 w-12 transition-colors duration-200 ${
                step >= 2 ? "bg-purple-500" : "bg-zinc-700"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 2 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label={step > 2 ? "Step 2 completed" : "Step 2"}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div
              className={`h-1 w-12 transition-colors duration-200 ${
                step >= 3 ? "bg-purple-500" : "bg-zinc-700"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 3 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label="Step 3"
            >
              3
            </div>
          </div>
          <div className="text-sm text-zinc-300" role="status">
            {step === 1 && "Upload"}
            {step === 2 && "Processing"}
            {step === 3 && "Confirm"}
          </div>
        </div>
      </nav>

      {step === 1 && (
        <section
          className="flex flex-col items-center"
          aria-label="Upload options"
        >
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6 hover:border-zinc-700 transition-colors">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-zinc-300" aria-hidden="true" />
              </div>
              <p className="text-center text-zinc-300 mb-4">
                Take a photo or upload your receipt
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Upload from gallery"
                  onClick={handleGalleryClick}
                >
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Gallery
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCameraClick}
                  aria-label="Take photo with camera"
                >
                  <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
                  Camera
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-zinc-300 mb-2">
            Accepted receipt types:
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            {["Paper", "Digital", "QR Code"].map((type) => (
              <div
                key={type}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-center text-xs text-white hover:border-zinc-700 transition-colors"
              >
                {type}
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section
          className="flex flex-col items-center"
          aria-label="Processing receipt"
        >
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 animate-pulse">
                <div
                  className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-label="Processing"
                ></div>
              </div>
              <p className="text-center font-medium text-white mb-2">
                Processing your receipt
              </p>
              <p className="text-center text-zinc-300 mb-4">
                Our AI is analyzing your receipt
              </p>
              <Progress
                value={progress}
                className="w-full h-2 bg-zinc-800"
                aria-label={`Processing progress: ${progress}%`}
              />
              <p className="text-xs text-zinc-400 mt-2">
                This may take a few seconds
              </p>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={simulateProgress}
            disabled={isProcessing}
            aria-label="Start processing"
          >
            {isProcessing ? "Processing..." : "Simulate Processing"}
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col" aria-label="Confirm receipt details">
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Receipt Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-purple-400 hover:text-purple-300 transition-colors"
                  aria-label="Edit receipt details"
                >
                  Edit
                </Button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Venue", value: "Neon Lounge" },
                  { label: "Date", value: "May 19, 2025" },
                  { label: "Total Amount", value: "$42.50" },
                  { label: "Items", value: "3 drinks" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-300">{label}</span>
                    <span className="font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-200">Estimated SipCoins</span>
                  <span className="text-xl font-bold text-purple-400">125</span>
                </div>
                <div className="text-xs text-zinc-400">
                  + 85 base points (receipt total)
                </div>
                <div className="text-xs text-zinc-400">
                  + 40 bonus points (first visit)
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Submit receipt for processing"
          >
            Submit Receipt
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </section>
      )}
    </div>
  );
}
