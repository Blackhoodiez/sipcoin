// Extract project ref from the Supabase URL
function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  // Example: https://pdtegxikpzrdlnuilaql.supabase.co
  return url.replace(/^https:\/\//, "").replace(/\..*$/, "");
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(new URL("/auth-error", requestUrl.origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          return cookieStore.get(name)?.value;
        },
        set: (name, value, options) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error("Error setting cookie:", error);
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.delete(name);
          } catch (error) {
            console.error("Error removing cookie:", error);
          }
        },
      },
    }
  );

  try {
    console.log("🔄 API Callback: Exchanging code for session...");

    // Exchange the code for a session
    const {
      data: { session },
      error: exchangeError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(new URL("/auth-error", requestUrl.origin));
    }

    if (!session) {
      console.error("No session after code exchange");
      return NextResponse.redirect(new URL("/auth-error", requestUrl.origin));
    }

    console.log(
      "✅ API Callback: Session created for user:",
      session.user.email
    );
    console.log(
      "🔧 API Callback: Session access token:",
      session.access_token ? "Present" : "Missing"
    );
    console.log(
      "🔧 API Callback: Session refresh token:",
      session.refresh_token ? "Present" : "Missing"
    );

    // Debug: Check what cookies are set after session exchange
    const cookiesAfterExchange = cookieStore.getAll();
    console.log(
      "🔧 API Callback: Cookies after session exchange:",
      cookiesAfterExchange.map((c) => c.name)
    );

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Profile doesn't exist, create it with all required fields
        console.log(
          "🔧 API Callback: Creating profile for user:",
          session.user.email
        );
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || "",
            is_profile_completed: false,
            username: null,
            bio: null,
            date_of_birth: null,
            gender: null,
            location: null,
            interests: null,
            avatar_url: null,
          },
        ]);
        if (insertError) {
          console.error("Error creating profile:", insertError);
          return NextResponse.redirect(
            new URL("/auth-error", requestUrl.origin)
          );
        }
        console.log("✅ API Callback: Profile created successfully");
      } else {
        console.error("Error checking profile:", profileError);
        return NextResponse.redirect(new URL("/auth-error", requestUrl.origin));
      }
    } else {
      console.log("✅ API Callback: Profile already exists");
    }

    // Debug: Check what cookies are set before redirect
    const cookiesBeforeRedirect = cookieStore.getAll();
    console.log(
      "🔧 API Callback: Cookies before redirect:",
      cookiesBeforeRedirect.map((c) => c.name)
    );

    // ✅ Redirect to login with success message for better UX
    console.log(
      "🔄 API Callback: Redirecting to login with success message..."
    );

    // Create response with redirect to login
    const response = NextResponse.redirect(
      new URL(
        "/auth/login?signup=success&email=" +
          encodeURIComponent(session.user.email || ""),
        requestUrl.origin
      ),
      303 // Use 303 for better browser compatibility
    );

    // Manually set the session cookies in the response for future login
    const sessionCookies = cookieStore.getAll();
    console.log(
      "🔧 API Callback: Setting cookies in response:",
      sessionCookies.map((c) => c.name)
    );

    for (const cookie of sessionCookies) {
      // Set cookies with proper options for client-side access
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    console.log("🔧 API Callback: Response cookies set successfully");
    return response;
  } catch (error) {
    console.error("Unexpected error in callback:", error);
    return NextResponse.redirect(new URL("/auth-error", requestUrl.origin));
  }
}
