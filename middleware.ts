import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "./lib/types/roles";

// Define protected routes and their required roles
// const PROTECTED_ROUTES: Record<string, UserRole> = {
//   "/admin": "admin",
//   "/moderator": "moderator",
//   "/admin/users": "admin",
//   "/admin/settings": "admin",
//   "/moderator/reports": "moderator",
// };

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("Middleware: Request path:", pathname);

  // Skip static files and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".png") ||
    pathname.startsWith("/.well-known")
  ) {
    console.log("Middleware: Skipping static asset:", pathname);
    return NextResponse.next();
  }

  const supabase = await createClient();

  let user = null;

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
    console.log("Middleware: Auth success - User:", user?.email || "none");

    // Add more detailed logging for debugging
    if (user) {
      console.log("Middleware: User ID:", user.id);
      console.log("Middleware: User email:", user.email);
    }
  } catch (err: any) {
    console.warn("❗Middleware auth error (soft fail):", err.message || err);
    console.log("Middleware: Allowing request through after auth soft fail");
    return NextResponse.next(); // Allow through temporarily
  }

  // 🚫 No user and not on auth routes? Redirect to login
  if (!user && !pathname.startsWith("/auth")) {
    console.log("Middleware: No user, redirecting to login");
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Profile check logic
  if (user && !pathname.startsWith("/profile-completion")) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_profile_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.is_profile_completed) {
        console.log(
          "Middleware: Profile incomplete, redirecting to profile-completion"
        );
        return NextResponse.redirect(
          new URL("/profile-completion", request.url)
        );
      }
      console.log("Middleware: Profile complete, allowing access");
    } catch (profileError) {
      console.warn(
        "❗Middleware profile check error (soft fail):",
        profileError
      );
      console.log(
        "Middleware: Allowing request through after profile soft fail"
      );
      return NextResponse.next(); // Allow through temporarily
    }
  }

  console.log(
    "Middleware: Allowing path:",
    pathname,
    "User:",
    user?.email || "none"
  );
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
