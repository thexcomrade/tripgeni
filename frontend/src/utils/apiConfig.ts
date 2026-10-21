/**
 * Resolves the backend API URL dynamically across environments.
 *
 * Priority:
 * 1. Runtime override in localStorage ('tripgenius_api_url')
 * 2. NEXT_PUBLIC_API_URL environment variable
 * 3. Localhost proxy rewrite on desktop/local browsers (empty string -> /api proxy)
 * 4. Production fallback for Vercel deployments -> Render backend URL
 * 5. Localhost absolute fallback: http://127.0.0.1:8000
 */
export const DEFAULT_PRODUCTION_BACKEND = "https://tripgenius-backend.onrender.com";

export const getApiBaseUrl = (): string => {
  // 1. Check user-configured override
  if (typeof window !== "undefined") {
    try {
      const customUrl = localStorage.getItem("tripgenius_api_url")?.trim();
      if (customUrl) {
        return customUrl.replace(/\/+$/, "");
      }
    } catch {
      // ignore localStorage errors in private browsing
    }
  }

  // 2. Environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Browser environment heuristics
  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    // Local dev: use relative /api proxy configured in next.config.mjs
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "";
    }

    // Deployed on Vercel: default to Render backend instead of unreachable localhost
    if (hostname.includes("vercel.app") || hostname.includes("tripgenius")) {
      return DEFAULT_PRODUCTION_BACKEND;
    }
  }

  return "http://127.0.0.1:8000";
};
