import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "avatar" | "card" | "button" | "circle";
  lines?: number;
  width?: string;
  height?: string;
}

export function Skeleton({
  className,
  variant = "default",
  lines = 1,
  width,
  height,
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-zinc-700/50 rounded h-4",
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div
        className={cn(
          "animate-pulse bg-zinc-700/50 rounded-full",
          width || "w-12",
          height || "h-12",
          className
        )}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="animate-pulse bg-zinc-700/50 rounded h-4 w-3/4" />
        <div className="animate-pulse bg-zinc-700/50 rounded h-4 w-full" />
        <div className="animate-pulse bg-zinc-700/50 rounded h-4 w-2/3" />
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div
        className={cn(
          "animate-pulse bg-zinc-700/50 rounded-md h-10 w-24",
          className
        )}
      />
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn(
          "animate-pulse bg-zinc-700/50 rounded-full",
          width || "w-8",
          height || "h-8",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-700/50 rounded",
        width,
        height || "h-4",
        className
      )}
    />
  );
}

// Profile skeleton component
export function ProfileSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton variant="button" />
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
        {/* Avatar and Info */}
        <div className="flex items-center space-x-4">
          <Skeleton variant="avatar" width="w-16" height="h-16" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
              <Skeleton className="h-6 w-16 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats skeleton component
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
          <Skeleton className="h-6 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Modal skeleton component
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg">
        {/* Header */}
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton variant="circle" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center space-x-4">
              <Skeleton variant="avatar" width="w-20" height="h-20" />
              <div className="flex space-x-2">
                <Skeleton variant="button" />
                <Skeleton variant="button" />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </div>
      </div>
    </div>
  );
}
