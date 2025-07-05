"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  validateUsername,
  validateDate,
  sanitizeProfileData,
  validateProfileData,
} from "@/lib/utils";
import {
  Loader2,
  Upload,
  X,
  Camera,
  Save,
  ArrowLeft,
  User,
  Sparkles,
  MapPin,
  Calendar,
  Heart,
} from "lucide-react";
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

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialProfile: {
    full_name: string;
    username: string;
    bio: string;
    date_of_birth: string | null;
    gender: string;
    location: string;
    interests: string;
    avatar_url: string | null;
  } | null;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  initialProfile,
}: ProfileEditModalProps) {
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

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && initialProfile) {
      console.log("Loading initial profile data:", initialProfile);
      setFormData({
        full_name: initialProfile.full_name || "",
        username: initialProfile.username || "",
        bio: initialProfile.bio || "",
        date_of_birth: initialProfile.date_of_birth || "",
        gender: initialProfile.gender || "",
        location: initialProfile.location || "",
        interests: initialProfile.interests || "",
        avatar_url: initialProfile.avatar_url || "",
      });
      setPreviewUrl(initialProfile.avatar_url || null);
    } else if (isOpen) {
      // Reset form when opening without initial data
      setFormData({
        full_name: "",
        username: "",
        bio: "",
        date_of_birth: "",
        gender: "",
        location: "",
        interests: "",
      });
      setPreviewUrl(null);
    }
  }, [isOpen, initialProfile]);

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

      // Upload file to storage
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

      // Persist immediately so the profile row is updated even before Save
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

      // Extract filename from URL
      const urlParts = formData.avatar_url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from("avatars")
        .remove([fileName]);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, avatar_url: "" }));
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
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        toast.error("Authentication error: " + authError.message);
        setIsSubmitting(false);
        return;
      }
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

      // Check username uniqueness if username is provided
      if (formData.username && formData.username.trim()) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", formData.username.trim())
          .neq("id", user.id)
          .maybeSingle();
        if (checkError) {
          toast.error("Error checking username availability");
          setIsSubmitting(false);
          return;
        }
        if (existingUser) {
          toast.error("Username already taken. Please choose a different one.");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare the profile data with proper sanitization
      const profileData = sanitizeProfileData({
        id: user.id,
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        gender: formData.gender,
        location: formData.location,
        interests: formData.interests,
        avatar_url: formData.avatar_url,
        date_of_birth: formData.date_of_birth,
        is_profile_completed: true,
      });

      const { data, error } = await supabase
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

      toast.success("Profile updated successfully");
      onSave();
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 animate-scale-in shadow-glow">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text animate-fade-in-left">
              Edit Profile
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover-lift-sm active-scale-sm"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4 animate-fade-in-up">
              <Label className="text-sm font-medium text-white flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Profile Picture
              </Label>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 transition-all duration-300 group-hover:border-purple-400 group-hover:shadow-glow">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center animate-pulse-slow">
                        <Camera className="w-8 h-8 text-purple-300" />
                      </div>
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover-lift-sm active-scale-sm shadow-soft-dark"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover-lift-sm active-scale-sm shadow-soft-dark"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="full_name"
                  className="text-sm font-medium text-white flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-white flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                  placeholder="Choose a unique username"
                />
              </div>
            </div>

            {/* Bio */}
            <div
              className="space-y-2 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Label
                htmlFor="bio"
                className="text-sm font-medium text-white flex items-center"
              >
                <Heart className="w-4 h-4 mr-2" />
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Personal Information */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="date_of_birth"
                  className="text-sm font-medium text-white flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-sm font-medium text-white flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Gender
                </Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                  placeholder="Your gender"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-white flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Interests */}
            <div
              className="space-y-2 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Label
                htmlFor="interests"
                className="text-sm font-medium text-white flex items-center"
              >
                <Heart className="w-4 h-4 mr-2" />
                Interests
              </Label>
              <Textarea
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus-ring shadow-soft-dark"
                placeholder="What are your interests? (e.g., cocktails, nightlife, music)"
              />
            </div>

            {/* Action Buttons */}
            <div
              className="flex justify-end space-x-3 pt-4 border-t border-zinc-800 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover-lift-sm active-scale-sm shadow-soft-dark"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover-lift-sm active-scale-sm shadow-glow"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
