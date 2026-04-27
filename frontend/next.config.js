/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for Docker multi-stage build (node server.js)
    output: 'standalone',

    async rewrites() {
        // Use env var so backend URL is configurable in Docker
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${apiBase}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
