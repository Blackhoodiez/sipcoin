"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Upload, X, Camera, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { optimizeImage } from "@/lib/image-optimization";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
}: AvatarUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset error state
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        toast.error("Image size should be less than 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No active session");
        }

        // Optimize image before upload
        const optimizedBlob = await optimizeImage(file);
        const optimizedFile = new File([optimizedBlob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        const fileExt = "jpg";
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, optimizedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        onChange(publicUrl);
        toast.success("Profile picture uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to upload profile picture";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, supabase]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovered(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files;
          handleFileChange({ target: { files: dataTransfer.files } } as any);
        }
      }
    },
    [handleFileChange]
  );

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "relative w-32 h-32 rounded-full overflow-hidden border-2 transition-colors",
          isHovered ? "border-purple-500" : "border-purple-500/50",
          error ? "border-red-500" : "",
          "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {value ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <Image
                src={value}
                alt="Profile preview"
                fill
                className="object-cover"
                sizes="(max-width: 128px) 100vw, 128px"
                priority
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="p-2 rounded-full bg-purple-500/80 hover:bg-purple-500 transition-colors"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-purple-500/50 mx-auto mb-2" />
                <p className="text-sm text-purple-500/50">Upload Photo</p>
                <p className="text-xs text-purple-500/30 mt-1">
                  or drag and drop
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-0 right-0 flex items-center justify-center text-red-500 text-xs"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </motion.div>
        )}
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onRemove}
          disabled={disabled || isUploading}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
