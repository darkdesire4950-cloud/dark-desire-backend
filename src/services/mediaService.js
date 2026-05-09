import multer from 'multer'
import multerS3 from 'multer-s3'
import { getS3Client, deleteFromS3 } from '../config/aws.js'
import cloudinary from '../config/cloudinary.js'
import { ApiError } from '../utils/ApiResponse.js'

// Helper to detect if a URL is from Cloudinary
export const isCloudinaryUrl = (url) => {
  if (!url) return false
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com')
}

// S3 storage configuration for new uploads
let s3Storage = null
let multerInstance = null

const getS3Storage = () => {
  if (!s3Storage) {
    const s3 = getS3Client()
    const bucket = process.env.AWS_S3_BUCKET

    s3Storage = multerS3({
      s3,
      bucket,
      acl: 'public-read',
      key: (req, file, cb) => {
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.originalname}`
        cb(null, `dark-desire/${filename}`)
      },
    })
  }
  return s3Storage
}

// Get multer instance (lazy initialization)
const getMulterInstance = () => {
  if (!multerInstance) {
    multerInstance = multer({ storage: getS3Storage() })
  }
  return multerInstance
}

// Export upload object with lazy-loaded middleware
export const upload = {
  single: (fieldName) => (req, res, next) => {
    getMulterInstance().single(fieldName)(req, res, next)
  },
  array: (fieldName, maxCount) => (req, res, next) => {
    getMulterInstance().array(fieldName, maxCount)(req, res, next)
  },
}

// Delete asset function - handles both S3 and Cloudinary
export const deleteAsset = async (identifier, source = 'auto') => {
  if (!identifier) {
    throw new ApiError(400, 'identifier is required to delete an asset')
  }

  // Auto-detect source if not specified
  if (source === 'auto') {
    source = isCloudinaryUrl(identifier) ? 'cloudinary' : 's3'
  }

  if (source === 'cloudinary') {
    // Delete from Cloudinary using publicId
    const result = await cloudinary.uploader.destroy(identifier)
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new ApiError(500, 'Unable to delete asset from Cloudinary', result)
    }
    return result
  } else if (source === 's3') {
    // Delete from S3 using key
    return await deleteFromS3(identifier)
  } else {
    throw new ApiError(400, 'Invalid source. Must be "s3" or "cloudinary"')
  }
}

