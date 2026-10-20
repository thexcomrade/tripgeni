
/**
 * Resolves the backend API URL.
 *
 * Production: use the Render backend URL configured in
 * NEXT_PUBLIC_API_URL.
 *
 * Local development: use the local Next.js proxy or local backend.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    // Use the Next.js proxy when testing locally or over a LAN.
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }

    // Never silently route a deployed frontend to itself.
    return "";
  }

  return "http://127.0.0.1:8000";
};
