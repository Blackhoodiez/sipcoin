import { createBrowserClient } from "@supabase/ssr";

// Create a single instance of the Supabase client for browser usage
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    cookies: {
      get(name: string) {
        if (typeof document === "undefined") return null;

        // Debug: Log all cookies
        console.log("🔧 Client: All cookies:", document.cookie);

        const value = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${name}=`))
          ?.split("=")[1];
        console.log(
          `🔧 Client: Getting cookie ${name}:`,
          value ? "Found" : "Not found"
        );
        if (value) {
          console.log(`🔧 Client: Cookie ${name} value length:`, value.length);
        }
        return value;
      },
      set(
        name: string,
        value: string,
        options: { path?: string; maxAge?: number }
      ) {
        if (typeof document === "undefined") return;
        document.cookie = `${name}=${value}; path=${
          options.path || "/"
        }; max-age=${options.maxAge || 3600}`;
      },
      remove(name: string, options: { path?: string }) {
        if (typeof document === "undefined") return;
        document.cookie = `${name}=; path=${options.path || "/"}; max-age=0`;
      },
    },
  }
);
