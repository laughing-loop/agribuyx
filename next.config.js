const indexNowKey = process.env.INDEXNOW_KEY || 'd428a576ae7f438bbb80ca6edacd1b33'

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Allow next/image to optimise images from Cloudinary
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
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
                source: `/${indexNowKey}.txt`,
                destination: `/api/indexnow-key?path=${indexNowKey}`,
            }
        ]
    },
}

module.exports = nextConfig
