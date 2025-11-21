import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiResponse.js'

// Helper to normalize media fields (convert string URLs to media objects)
const normalizeMediaField = (value) => {
  if (!value) return undefined
  if (typeof value === 'string') {
    const url = value.trim()
    if (!url) return undefined
    
    // Try to extract publicId from Cloudinary URL
    const cloudinaryMatch = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/)
    const publicId = cloudinaryMatch ? cloudinaryMatch[1] : url.split('/').pop().split('.')[0]
    
    return { url, publicId }
  }
  if (typeof value === 'object' && value.url) {
    return value
  }
  return undefined
}

const normalizeProductData = (data) => {
  const normalized = { ...data }
  
  // Normalize primaryImage
  if (normalized.primaryImage !== undefined) {
    normalized.primaryImage = normalizeMediaField(normalized.primaryImage)
  }
  
  // Normalize gallery array
  if (normalized.gallery && Array.isArray(normalized.gallery)) {
    normalized.gallery = normalized.gallery
      .map(item => normalizeMediaField(item))
      .filter(item => item !== undefined) // Remove empty/invalid items
  }
  
  // Ensure arrays are arrays
  if (normalized.features && !Array.isArray(normalized.features)) {
    normalized.features = []
  }
  if (normalized.tags && !Array.isArray(normalized.tags)) {
    normalized.tags = []
  }
  if (normalized.specifications && !Array.isArray(normalized.specifications)) {
    normalized.specifications = []
  }
  
  return normalized
}

export const getProducts = async ({ page = 1, limit = 20, status, search, category }) => {
  const filter = {}

  if (status) {
    filter.status = status
  }

  if (category) {
    // Match category by slug, name, or exact match (case-insensitive)
    filter.category = { $regex: new RegExp(`^${category}$`, 'i') }
  }

  if (search) {
    // If category filter exists, combine with search using $and
    if (filter.category) {
      filter.$and = [
        { category: filter.category },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        },
      ]
      delete filter.category
    } else {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  return {
    items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  }
}

export const getProductById = async (id) => {
  const product = await Product.findById(id)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }
  return product
}

export const createProduct = (payload) => {
  const normalized = normalizeProductData(payload)
  return Product.create(normalized)
}

export const updateProduct = async (id, payload) => {
  const normalized = normalizeProductData(payload)
  const product = await Product.findByIdAndUpdate(id, normalized, { new: true })
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }
  return product
}

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }
  return product
}

