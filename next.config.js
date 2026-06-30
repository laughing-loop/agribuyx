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
}

module.exports = nextConfig
