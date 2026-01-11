// Cloudinary utility functions for Next.js
// Note: The cloudinary SDK is server-side only, so we only import it when needed

/**
 * Generate a Cloudinary URL with transformations
 * This works on both client and server side
 * @param publicId - The Cloudinary public ID of the image or full URL
 * @param transformations - Object with transformation options
 * @returns Transformed image URL
 */
export function getCloudinaryUrl(
    publicId: string,
    transformations?: {
        width?: number
        height?: number
        crop?: string
        quality?: string | number
        format?: string
        gravity?: string
        overlay?: string
        effect?: string
    }
): string {
    if (!publicId) return ''

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwg0ofyea'

    // If it's already a full URL (not from Cloudinary), return as is
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
        if (!publicId.includes('cloudinary.com')) {
            return publicId
        }
        // If it's already a Cloudinary URL, return it
        return publicId
    }

    // Build transformation string
    const transforms: string[] = []

    if (transformations) {
        if (transformations.width) transforms.push(`w_${transformations.width}`)
        if (transformations.height) transforms.push(`h_${transformations.height}`)
        if (transformations.crop) transforms.push(`c_${transformations.crop}`)
        if (transformations.quality) transforms.push(`q_${transformations.quality}`)
        if (transformations.format) transforms.push(`f_${transformations.format}`)
        if (transformations.gravity) transforms.push(`g_${transformations.gravity}`)
        if (transformations.overlay) transforms.push(`l_${transformations.overlay}`)
        if (transformations.effect) transforms.push(`e_${transformations.effect}`)
    }

    const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : ''

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`
}

/**
 * Get a watermarked image URL
 * @param publicId - The Cloudinary public ID or full URL
 * @returns URL with watermark overlay and optimization
 */
export function getWatermarkedImageUrl(publicId: string): string {
    if (!publicId) return ''

    // Check if it's already a Cloudinary URL
    if (publicId.includes('cloudinary.com')) {
        return publicId
    }

    // Check if it's a regular URL (not Cloudinary)
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
        return publicId
    }

    // Apply watermark transformation
    return getCloudinaryUrl(publicId, {
        quality: 'auto',
        format: 'auto',
        // Uncomment and customize watermark when you have a watermark image uploaded to Cloudinary
        // overlay: 'watermark_image_public_id',
        // gravity: 'south_east',
    })
}

/**
 * Get optimized thumbnail URL
 * @param publicId - The Cloudinary public ID or full URL
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(publicId: string, width = 300, height = 300): string {
    if (!publicId) return ''

    // Check if it's already a full URL
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
        if (publicId.includes('cloudinary.com')) {
            return publicId
        }
        return publicId
    }

    return getCloudinaryUrl(publicId, {
        width,
        height,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
        gravity: 'auto',
    })
}

/**
 * Extract Cloudinary public ID from a full URL
 * @param url - Full Cloudinary URL
 * @returns Public ID or original URL if not a Cloudinary URL
 */
export function extractPublicId(url: string): string {
    if (!url) return ''

    // If it's not a Cloudinary URL, return as is
    if (!url.includes('cloudinary.com')) {
        return url
    }

    // Extract public ID from Cloudinary URL
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : url
}

/**
 * Check if a URL is a Cloudinary URL
 * @param url - URL to check
 * @returns True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com')
}

// Server-side only: Export cloudinary instance for API routes
// This will only be imported in API routes, not in client-side code
export async function getCloudinaryInstance() {
    if (typeof window !== 'undefined') {
        throw new Error('Cloudinary SDK can only be used on the server side')
    }

    const { v2: cloudinary } = await import('cloudinary')

    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    return cloudinary
}
