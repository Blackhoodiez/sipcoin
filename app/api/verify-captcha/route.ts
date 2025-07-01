import { NextResponse } from "next/server";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

if (!RECAPTCHA_SECRET_KEY) {
  throw new Error("Missing RECAPTCHA_SECRET_KEY environment variable");
}

export async function POST(request: Request) {
  try {
    const { token, action } = await request.json();

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    if (data.action !== action) {
      return NextResponse.json(
        { success: false, error: "Invalid CAPTCHA action" },
        { status: 400 }
      );
    }

    if (data.score < 0.5) {
      return NextResponse.json(
        { success: false, error: "Suspicious activity detected" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
