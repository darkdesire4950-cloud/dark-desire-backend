/**
 * Storage Utility Helper
 * 
 * Detects image storage source and provides utilities for handling both S3 and Cloudinary images
 * 
 * Usage:
 * const sourceInfo = detectStorageSource(imageUrl);
 * if (sourceInfo.isS3) { ... }
 * if (sourceInfo.isCloudinary) { ... }
 */

export const StorageUtil = {
  /**
   * Detect if URL is from S3 or Cloudinary
   * @param {string} url - Image URL
   * @returns {object} Object with isS3, isCloudinary, and source properties
   */
  detectStorageSource: (url) => {
    if (!url) return { isS3: false, isCloudinary: false, source: null }

    const isS3 = url.includes('.s3.') || url.includes('s3.amazonaws.com')
    const isCloudinary = url.includes('cloudinary.com') || url.includes('res.cloudinary.com')

    return {
      isS3,
      isCloudinary,
      source: isS3 ? 's3' : isCloudinary ? 'cloudinary' : null,
    }
  },

  /**
   * Extract S3 bucket name from URL
   * @param {string} url - S3 URL
   * @returns {string} Bucket name or null
   */
  getS3Bucket: (url) => {
    if (!url) return null
    const match = url.match(/^https:\/\/([^.]+)\.s3/)
    return match ? match[1] : null
  },

  /**
   * Extract S3 file key from URL
   * @param {string} url - S3 URL
   * @returns {string} File key or null
   */
  getS3Key: (url) => {
    if (!url) return null
    const match = url.match(/\.amazonaws\.com\/(.+)$/)
    return match ? match[1] : null
  },

  /**
   * Extract Cloudinary public ID from URL
   * @param {string} url - Cloudinary URL
   * @returns {string} Public ID or null
   */
  getCloudinaryPublicId: (url) => {
    if (!url) return null
    const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  },

  /**
   * Get identifier for deletion endpoint
   * For S3: returns the S3 key
   * For Cloudinary: returns the public ID
   * @param {string} url - Image URL
   * @returns {string} Identifier for deletion
   */
  getDeleteIdentifier: (url) => {
    const source = StorageUtil.detectStorageSource(url)

    if (source.isS3) {
      return StorageUtil.getS3Key(url)
    } else if (source.isCloudinary) {
      return StorageUtil.getCloudinaryPublicId(url)
    }

    return null
  },

  /**
   * Format media object for API
   * Handles both S3 and Cloudinary formats
   * @param {string|object} mediaInput - URL string or media object
   * @returns {object} Normalized media object
   */
  normalizeMedia: (mediaInput) => {
    if (!mediaInput) return null

    // If it's a string URL, convert to object
    if (typeof mediaInput === 'string') {
      const url = mediaInput.trim()
      if (!url) return null

      const source = StorageUtil.detectStorageSource(url)

      if (source.isS3) {
        return {
          url,
          s3Key: StorageUtil.getS3Key(url),
          source: 's3',
        }
      } else if (source.isCloudinary) {
        return {
          url,
          publicId: StorageUtil.getCloudinaryPublicId(url),
          source: 'cloudinary',
        }
      }

      return { url }
    }

    // If it's already an object, enhance it with source detection
    if (typeof mediaInput === 'object' && mediaInput.url) {
      const source = StorageUtil.detectStorageSource(mediaInput.url)
      return {
        ...mediaInput,
        source: source.source,
      }
    }

    return null
  },

  /**
   * Delete image endpoint helper
   * Automatically detects source and returns proper delete URL
   * @param {string} url - Image URL or identifier
   * @returns {object} { endpoint: string, params: object }
   */
  getDeleteEndpoint: (url) => {
    const identifier = StorageUtil.getDeleteIdentifier(url)
    if (!identifier) return null

    const source = StorageUtil.detectStorageSource(url)

    return {
      endpoint: `/api/media/${identifier}`,
      params: {
        // Optional: explicitly specify source for clarity
        source: source.source,
      },
    }
  },
}

/**
 * Example usage in your frontend:
 */

/*
// 1. Detect image source
const imageUrl = "https://bucket.s3.us-east-1.amazonaws.com/dark-desire/image.jpg"
const source = StorageUtil.detectStorageSource(imageUrl)
console.log(source) // { isS3: true, isCloudinary: false, source: 's3' }

// 2. Delete an image
const deleteInfo = StorageUtil.getDeleteEndpoint(imageUrl)
await fetch(deleteInfo.endpoint, { method: 'DELETE' })

// 3. Normalize media for API
const productData = {
  primaryImage: StorageUtil.normalizeMedia(imageUrl),
  gallery: images.map(url => StorageUtil.normalizeMedia(url))
}

// 4. Store media objects
const mediaObject = {
  url: "https://bucket.s3.us-east-1.amazonaws.com/dark-desire/image.jpg",
  s3Key: "dark-desire/image.jpg"  // Use this for deletion later
}
*/
