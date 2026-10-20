/**
 * Global API base URL resolver.
 * Handles both desktop localhost and mobile phone / LAN testing seamlessly:
 * 1. If on mobile / LAN (hostname != localhost), returns "" so requests are proxied via Next.js rewrite (bypassing Windows Firewall port 8000 block)
 * 2. If explicit production remote URL (Render / Railway), uses that URL
 * 3. Default fallback to http://127.0.0.1:8000 for local desktop development
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // When accessing from mobile phone or LAN IP (192.168.x.x, 10.x.x.x, etc.)
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "";
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8000";
};
