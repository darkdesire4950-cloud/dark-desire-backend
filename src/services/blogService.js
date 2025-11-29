import Blog from '../models/Blog.js'
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

const normalizeBlogData = (data) => {
  const normalized = { ...data }
  
  if (normalized.featuredImage !== undefined) {
    normalized.featuredImage = normalizeMediaField(normalized.featuredImage)
  }
  
  // Ensure tags is an array
  if (normalized.tags && !Array.isArray(normalized.tags)) {
    normalized.tags = []
  }
  
  // Generate slug if not provided
  if (!normalized.slug && normalized.title) {
    normalized.slug = normalized.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  
  return normalized
}

export const getBlogs = async (filters = {}) => {
  const query = {}
  
  // Filter by status
  if (filters.status) {
    query.status = filters.status
  }
  
  // Filter by category
  if (filters.category) {
    query.category = filters.category
  }
  
  // Filter by featured
  if (filters.featured !== undefined) {
    query.featured = filters.featured === 'true' || filters.featured === true
  }
  
  const items = await Blog.find(query).sort({ createdAt: -1 })
  return { items, meta: { total: items.length } }
}

export const getBlogById = async (id) => {
  const blog = await Blog.findById(id)
  if (!blog) {
    throw new ApiError(404, 'Blog post not found')
  }
  return blog
}

export const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug })
  if (!blog) {
    throw new ApiError(404, 'Blog post not found')
  }
  
  // Increment views
  blog.views += 1
  await blog.save()
  
  return blog
}

export const createBlog = async (payload) => {
  const normalized = normalizeBlogData(payload)
  
  // Check for duplicate slug
  const existing = await Blog.findOne({ slug: normalized.slug })
  if (existing) {
    normalized.slug = `${normalized.slug}-${Date.now()}`
  }
  
  return Blog.create(normalized)
}

export const updateBlog = async (id, payload) => {
  const normalized = normalizeBlogData(payload)
  
  const blog = await Blog.findByIdAndUpdate(id, normalized, { new: true, runValidators: true })
  if (!blog) {
    throw new ApiError(404, 'Blog post not found')
  }
  return blog
}

export const deleteBlog = async (id) => {
  const blog = await Blog.findByIdAndDelete(id)
  if (!blog) {
    throw new ApiError(404, 'Blog post not found')
  }
  return blog
}

export const getPublishedBlogs = async (limit = 10) => {
  const items = await Blog.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
  return { items, meta: { total: items.length } }
}

export const getFeaturedBlogs = async () => {
  const items = await Blog.find({ status: 'published', featured: true })
    .sort({ publishedAt: -1 })
    .limit(5)
  return { items, meta: { total: items.length } }
}

