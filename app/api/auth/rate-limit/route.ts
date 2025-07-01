import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Rate limit configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing required environment variables");
      return Response.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return Response.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, type = "login" } = body;

    if (!email || !type) {
      console.error("Missing required fields:", { email, type });
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get IP address from headers
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    console.log("Rate limit check:", { email, type, ip });

    // Check for existing attempts
    const { data: attempts, error: checkError } = await supabase
      .from("auth_attempts")
      .select("*")
      .eq("ip_address", ip)
      .eq("email", email)
      .eq("attempt_type", type)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (checkError) {
      console.error("Error checking rate limit:", checkError);
      return Response.json(
        { success: false, error: "Rate limit check failed" },
        { status: 500 }
      );
    }

    console.log("Found attempts:", attempts?.length || 0);

    // If too many attempts, return error
    if (attempts && attempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = attempts[0];
      const expiresAt = new Date(oldestAttempt.expires_at);
      const now = new Date();
      const waitTime = Math.max(
        0,
        Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60))
      );

      console.log("Rate limit exceeded:", {
        attempts: attempts.length,
        waitTime,
        expiresAt: expiresAt.toISOString(),
      });

      return Response.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${waitTime} minutes.`,
          reset: expiresAt.getTime(),
        },
        { status: 429 }
      );
    }

    // Record new attempt
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + WINDOW_MINUTES);

    const { error: insertError } = await supabase.from("auth_attempts").insert({
      ip_address: ip,
      email,
      attempt_type: type,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error recording attempt:", insertError);
      return Response.json(
        { success: false, error: "Failed to record attempt" },
        { status: 500 }
      );
    }

    console.log("New attempt recorded successfully");
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in rate limit handler:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
