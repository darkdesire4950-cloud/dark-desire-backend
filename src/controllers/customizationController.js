import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiResponse, ApiError } from '../utils/ApiResponse.js'
import Customization from '../models/Customization.js'
import { sendInquiryEmail } from '../services/emailService.js'
import { customizationSchema } from '../validations/customizationValidation.js'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

// Handle multiple file uploads with custom folder
const customizationUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      return {
        folder: 'dark-desire/customizations',
        resource_type: 'auto',
        format: undefined,
        public_id: undefined,
      }
    },
  }),
})

export const uploadImages = customizationUpload.array('images', 5)

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

  // Get uploaded images
  const images = req.files?.map((file) => ({
    url: file.path,
    publicId: file.filename,
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

