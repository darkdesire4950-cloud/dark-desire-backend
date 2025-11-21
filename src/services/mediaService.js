import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'
import { ApiError } from '../utils/ApiResponse.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.body.folder || 'dark-desire/admin'
    return {
      folder,
      resource_type: 'auto',
      format: undefined,
      public_id: undefined,
    }
  },
})

export const upload = multer({ storage })

export const deleteAsset = async (publicId) => {
  if (!publicId) {
    throw new ApiError(400, 'publicId is required to delete an asset')
  }

  const result = await cloudinary.uploader.destroy(publicId)
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new ApiError(500, 'Unable to delete asset from Cloudinary', result)
  }
  return result
}

