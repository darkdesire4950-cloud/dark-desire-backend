import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiResponse, ApiError } from '../utils/ApiResponse.js'
import Customization from '../models/Customization.js'
import { sendInquiryEmail } from '../services/emailService.js'
import { customizationSchema } from '../validations/customizationValidation.js'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { getS3Client } from '../config/aws.js'

// Handle multiple file uploads with custom folder
let customizationUpload = null

const getCustomizationUpload = () => {
  if (!customizationUpload) {
    const s3 = getS3Client()
    const bucket = process.env.AWS_S3_BUCKET

    customizationUpload = multer({
      storage: multerS3({
        s3,
        bucket,
        acl: 'public-read',
        key: (req, file, cb) => {
          const timestamp = Date.now()
          const filename = `${timestamp}-${file.originalname}`
          cb(null, `dark-desire/customizations/${filename}`)
        },
      }),
    })
  }
  return customizationUpload
}

export const uploadImages = (req, res, next) => {
  getCustomizationUpload().array('images', 5)(req, res, next)
}

export const submitCustomization = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = customizationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const details = error.details.map((detail) => detail.message)
    throw new ApiError(422, 'Validation failed', details)
  }

  const { name, email, phone, company, country, description } = value

  // Get uploaded images (S3 format)
  const images = req.files?.map((file) => ({
    url: file.location, // S3 provides 'location' for the full URL
    s3Key: file.key,    // S3 file key
    originalName: file.originalname,
  })) || []

  // Create customization request
  const customization = await Customization.create({
    name,
    email,
    phone,
    company: company || '',
    country,
    description,
    images,
    status: 'pending',
  })

  // Send email notification to admin
  try {
    await sendInquiryEmail({
      name,
      email,
      phone,
      company: company || 'N/A',
      country,
      product: 'Custom Design Request',
      category: 'Customization',
      message: `Custom Design Request\n\nDescription: ${description}\n\nImages: ${images.length} image(s) uploaded.`,
    })
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError)
    // Don't fail the request if email fails
  }

  res.status(201).json(
    new ApiResponse(
      { customization },
      'Customization request submitted successfully',
    ),
  )
})

export const getAllCustomizations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const query = status ? { status } : {}

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const limitNum = parseInt(limit)

  const customizations = await Customization.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  const total = await Customization.countDocuments(query)

  res.json(
    new ApiResponse(
      {
        items: customizations,
        meta: {
          total,
          page: parseInt(page),
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      'Customizations retrieved successfully',
    ),
  )
})

export const getCustomizationById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const customization = await Customization.findById(id)

  if (!customization) {
    throw new ApiError(404, 'Customization request not found')
  }

  res.json(
    new ApiResponse({ customization }, 'Customization retrieved successfully'),
  )
})

export const updateCustomization = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, notes } = req.body

  const customization = await Customization.findById(id)

  if (!customization) {
    throw new ApiError(404, 'Customization request not found')
  }

  // Update status and notes
  if (status) {
    customization.status = status
    if (status !== 'pending' && !customization.reviewedAt) {
      customization.reviewedAt = new Date()
    }
  }
  if (notes !== undefined) {
    customization.notes = notes
  }

  await customization.save()

  res.json(
    new ApiResponse({ customization }, 'Customization updated successfully'),
  )
})

export const deleteCustomization = asyncHandler(async (req, res) => {
  const { id } = req.params
  const customization = await Customization.findById(id)

  if (!customization) {
    throw new ApiError(404, 'Customization request not found')
  }

  // TODO: Delete images from Cloudinary if needed
  await Customization.findByIdAndDelete(id)

  res.status(204).send()
})

