/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Allow next/image to optimise images from Cloudinary
    images: {
        domains: ['res.cloudinary.com'],
        formats: ['image/avif', 'image/webp'],
    },

    webpack: (config, { isServer }) => {
        // Fix for cloudinary package trying to use Node.js modules in the browser
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
                path: false,
                os: false,
            }
        }
        return config
    },

    async rewrites() {
        return [
            {
                // This allows Bing to request /[INDEXNOW_KEY].txt and we serve it dynamically
                source: '/:key',
                has: [
                    {
                        type: 'query',
                        key: 'key',
                        value: '(?<keyval>.*\\.txt$)', // only match .txt
                    },
                ],
                destination: '/api/indexnow-key',
            },
            // Fallback for when the query param match isn't perfect in some environments:
            {
                source: '/:path*.txt',
                destination: '/api/indexnow-key?path=:path*',
            }
        ]
    },
}

module.exports = nextConfig
