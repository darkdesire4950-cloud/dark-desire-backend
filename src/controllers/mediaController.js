import { asyncHandler } from '../middleware/asyncHandler.js'
import { deleteAsset } from '../services/mediaService.js'
import { ApiError, ApiResponse } from '../utils/ApiResponse.js'

export const handleSingleUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded')
  }

  const { path, filename, mimetype } = req.file
  res.status(201).json(
    new ApiResponse(
      { url: path, publicId: filename, mimeType: mimetype },
      'File uploaded successfully',
    ),
  )
})

export const handleMultipleUpload = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(400, 'No files uploaded')
  }

  const files = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    mimeType: file.mimetype,
  }))

  res.status(201).json(new ApiResponse(files, 'Files uploaded successfully'))
})

export const handleDeleteAsset = asyncHandler(async (req, res) => {
  const { publicId } = req.params
  await deleteAsset(publicId)
  res.json(new ApiResponse({ publicId }, 'Asset deleted from Cloudinary'))
})

