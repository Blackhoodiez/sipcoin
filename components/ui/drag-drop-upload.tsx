"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  previewUrl?: string | null;
  isUploading?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function DragDropUpload({
  onFileSelect,
  onFileRemove,
  previewUrl,
  isUploading = false,
  accept = "image/*",
  maxSize = 5,
  className,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return false;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size should be less than ${maxSize}MB`);
        return false;
      }

      return true;
    },
    [maxSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-purple-400 bg-purple-500/10 scale-105"
            : previewUrl
            ? "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            : "border-zinc-700 bg-zinc-800/50 hover:border-purple-400 hover:bg-purple-500/10",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Upload overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <div className="text-center">
              <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2 animate-bounce-in" />
              <p className="text-purple-300 font-medium">
                Drop your image here
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2" />
              <p className="text-white text-sm">Uploading...</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            {onFileRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors duration-300">
              <ImageIcon className="h-6 w-6 text-zinc-400 group-hover:text-purple-400 transition-colors duration-300" />
            </div>
            <p className="text-sm text-zinc-300 mb-2">
              <span className="font-medium text-purple-400">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-zinc-500">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-400 text-sm animate-fade-in-up flex items-center">
          <X className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}
