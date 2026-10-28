/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  env: {
    NEXT_PUBLIC_CARTO_API_KEY:
      process.env.NEXT_PUBLIC_CARTO_API_KEY || process.env.CARTO_API_KEY || '',
    CARTO_API_KEY:
      process.env.NEXT_PUBLIC_CARTO_API_KEY || process.env.CARTO_API_KEY || '',
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    // Only proxy /api/* to local FastAPI in development.
    // In production the frontend calls NEXT_PUBLIC_API_URL directly.
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
