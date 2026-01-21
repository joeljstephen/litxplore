/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        domains: ['arxiv.org'],
    },
    webpack: (config, { isServer }) => {
        // Add optimizations if needed
        config.cache = false; // Disable webpack cache temporarily
        return config;
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self';",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://warm-ram-79.clerk.accounts.dev https://cdn.jsdelivr.net;",
                            "style-src 'self' 'unsafe-inline';",
                            "img-src 'self' data: https: blob:;",
                            "font-src 'self' data:;",
                            "connect-src 'self' http://localhost:* http://127.0.0.1:* https://warm-ram-79.clerk.accounts.dev https://*.clerk.accounts.dev https://api.openai.com https://generativelanguage.googleapis.com ws://localhost:* ws://127.0.0.1:*;",
                            "frame-src 'self' https://warm-ram-79.clerk.accounts.dev https://*.clerk.accounts.dev https://arxiv.org http://localhost:* http://127.0.0.1:*;",
                            "object-src 'self' blob: data: https://arxiv.org;",
                            "worker-src 'self' blob:;",
                            "child-src 'self' blob:;",
                        ].join(' ')
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig;
