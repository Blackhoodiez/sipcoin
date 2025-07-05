"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  validateUsername,
  validateDate,
  sanitizeProfileData,
  validateProfileData,
} from "@/lib/utils";
import { Loader2, Upload, X, Camera } from "lucide-react";
import Image from "next/image";

// Maximum dimensions for avatar
const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;

interface ProfileFormData {
  full_name: string;
  username: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  location: string;
  interests: string;
  avatar_url?: string;
}

export default function ProfileCompletionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    username: "",
    bio: "",
    date_of_birth: "",
    gender: "",
    location: "",
    interests: "",
  });

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get initial profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          setFormData((prev) => ({
            ...prev,
            full_name: profile.full_name,
          }));
        }
      } catch (error) {
        console.error("Error fetching initial profile data:", error);
      }
    };

    getInitialData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No active user");
      }

      const fileExt = file.name.split(".").pop() ?? "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName.replace(/^\/+/, "");

      console.log("Uploading avatar file", file);
      console.log("Uploading to path", filePath);

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload profile picture");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.avatar_url) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No active user");
      }

      // Extract file path from URL
      const filePath = formData.avatar_url.split("/").pop();
      if (!filePath) return;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      setFormData((prev) => ({ ...prev, avatar_url: undefined }));
      setPreviewUrl(null);
      toast.success("Profile picture removed");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove profile picture");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("No active user");
        setIsSubmitting(false);
        return;
      }

      // Comprehensive validation
      const validation = validateProfileData(formData);
      if (!validation.isValid) {
        validation.errors.forEach((error) => toast.error(error));
        setIsSubmitting(false);
        return;
      }

      // Check if username is available - use maybeSingle() instead of single()
      if (formData.username && formData.username.trim()) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", formData.username.trim())
          .neq("id", user.id)
          .maybeSingle();
        if (checkError) {
          toast.error("Error checking username availability");
          setIsSubmitting(false);
          return;
        }
        if (existingUser) {
          toast.error("Username is already taken");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare profile data with proper sanitization
      const profileData = sanitizeProfileData({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        location: formData.location,
        interests: formData.interests,
        avatar_url: formData.avatar_url,
        is_profile_completed: true,
      });

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505") {
          toast.error(
            "Username is already taken. Please choose a different one."
          );
        } else if (error.code === "23514") {
          toast.error("Invalid data provided. Please check your input.");
        } else {
          toast.error("Failed to update profile. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("Profile completed successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-800">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-zinc-600" />
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Photo
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="full_name" className="text-zinc-300">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-zinc-300">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Choose a username"
                pattern="^[a-zA-Z0-9_]+$"
                title="Username can only contain letters, numbers, and underscores"
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth" className="text-zinc-300">
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                type="date"
                className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-zinc-300">
                Gender
              </Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Enter your gender"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-zinc-300">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Where are you from?"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio" className="text-zinc-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="interests" className="text-zinc-300">
                Interests
              </Label>
              <Textarea
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                placeholder="Tell us about your interests (e.g., comma-separated)"
                rows={2}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Complete Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
