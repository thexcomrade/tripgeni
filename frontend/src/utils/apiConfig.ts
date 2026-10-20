/**
 * Global API base URL resolver.
 * Priority:
 * 1. Explicit NEXT_PUBLIC_API_URL environment variable (production, staging, etc.)
 * 2. Current window origin with port 8000 when running on localhost / local LAN IP
 * 3. Default fallback to http://127.0.0.1:8000
 */
export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.")
    ) {
      return `${protocol}//${host}:8000`;
    }
  }

  return "http://127.0.0.1:8000";
};
