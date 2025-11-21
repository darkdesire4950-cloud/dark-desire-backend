import Category from '../models/Category.js'
import { ApiError } from '../utils/ApiResponse.js'

// Helper to normalize media fields (convert string URLs to media objects)
const normalizeMediaField = (value) => {
  if (!value) return undefined
  if (typeof value === 'string') {
    // If it's a string URL, create a media object with a generated publicId
    // Extract publicId from URL if it's a Cloudinary URL, otherwise use a hash
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

const normalizeCategoryData = (data) => {
  const normalized = { ...data }
  
  if (normalized.thumbnail !== undefined) {
    normalized.thumbnail = normalizeMediaField(normalized.thumbnail)
  }
  if (normalized.heroImage !== undefined) {
    normalized.heroImage = normalizeMediaField(normalized.heroImage)
  }
  
  // Ensure arrays are arrays
  if (normalized.highlights && !Array.isArray(normalized.highlights)) {
    normalized.highlights = []
  }
  if (normalized.seoKeywords && !Array.isArray(normalized.seoKeywords)) {
    normalized.seoKeywords = []
  }
  
  return normalized
}

export const getCategories = async () => {
  const items = await Category.find().sort({ displayOrder: 1 })
  return { items, meta: { total: items.length } }
}

export const getCategoryById = async (id) => {
  const category = await Category.findById(id)
  if (!category) {
    throw new ApiError(404, 'Category not found')
  }
  return category
}

export const createCategory = (payload) => {
  const normalized = normalizeCategoryData(payload)
  return Category.create(normalized)
}

export const updateCategory = async (id, payload) => {
  const normalized = normalizeCategoryData(payload)
  const category = await Category.findByIdAndUpdate(id, normalized, { new: true })
  if (!category) {
    throw new ApiError(404, 'Category not found')
  }
  return category
}

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id)
  if (!category) {
    throw new ApiError(404, 'Category not found')
  }
  return category
}

