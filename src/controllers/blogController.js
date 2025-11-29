import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createBlog,
  deleteBlog,
  getBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  getPublishedBlogs,
  getFeaturedBlogs,
} from '../services/blogService.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const listBlogs = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    category: req.query.category,
    featured: req.query.featured,
  }
  const data = await getBlogs(filters)
  res.json(new ApiResponse(data, 'Blog posts retrieved'))
})

export const showBlog = asyncHandler(async (req, res) => {
  const blog = await getBlogById(req.params.id)
  res.json(new ApiResponse(blog, 'Blog post retrieved'))
})

export const showBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await getBlogBySlug(req.params.slug)
  res.json(new ApiResponse(blog, 'Blog post retrieved'))
})

export const createBlogHandler = asyncHandler(async (req, res) => {
  const blog = await createBlog(req.body)
  res.status(201).json(new ApiResponse(blog, 'Blog post created'))
})

export const updateBlogHandler = asyncHandler(async (req, res) => {
  const blog = await updateBlog(req.params.id, req.body)
  res.json(new ApiResponse(blog, 'Blog post updated'))
})

export const deleteBlogHandler = asyncHandler(async (req, res) => {
  await deleteBlog(req.params.id)
  res.status(204).send()
})

export const listPublishedBlogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const data = await getPublishedBlogs(limit)
  res.json(new ApiResponse(data, 'Published blog posts retrieved'))
})

export const listFeaturedBlogs = asyncHandler(async (req, res) => {
  const data = await getFeaturedBlogs()
  res.json(new ApiResponse(data, 'Featured blog posts retrieved'))
})

