import { asyncHandler } from '../middleware/asyncHandler.js'
import { deleteAsset, isCloudinaryUrl } from '../services/mediaService.js'
import { ApiError, ApiResponse } from '../utils/ApiResponse.js'

export const handleSingleUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded')
  }

  const { location, key, mimetype } = req.file
  
  res.status(201).json(
    new ApiResponse(
      {
        url: location, // S3 provides 'location' for the full URL
        s3Key: key, // S3 file key
        mimeType: mimetype,
        source: 's3', // Explicitly mark as S3 upload
      },
      'File uploaded successfully to AWS S3',
    ),
  )
})

export const handleMultipleUpload = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(400, 'No files uploaded')
  }

  const files = req.files.map((file) => ({
    url: file.location, // S3 provides 'location' for the full URL
    s3Key: file.key, // S3 file key
    mimeType: file.mimetype,
    source: 's3', // Explicitly mark as S3 upload
  }))

  res.status(201).json(new ApiResponse(files, 'Files uploaded successfully to AWS S3'))
})

export const handleDeleteAsset = asyncHandler(async (req, res) => {
  const { identifier } = req.params
  const { source } = req.query // Optional: specify 's3' or 'cloudinary', auto-detect if not provided

  await deleteAsset(identifier, source)
  res.json(
    new ApiResponse(
      { identifier },
      isCloudinaryUrl(identifier) ? 'Asset deleted from Cloudinary' : 'Asset deleted from AWS S3',
    ),
  )
})

