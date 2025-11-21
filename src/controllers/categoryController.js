import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../services/categoryService.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const listCategories = asyncHandler(async (req, res) => {
  const data = await getCategories()
  res.json(new ApiResponse(data, 'Categories retrieved'))
})

export const showCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id)
  res.json(new ApiResponse(category, 'Category retrieved'))
})

export const createCategoryHandler = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body)
  res.status(201).json(new ApiResponse(category, 'Category created'))
})

export const updateCategoryHandler = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body)
  res.json(new ApiResponse(category, 'Category updated'))
})

export const deleteCategoryHandler = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id)
  res.status(204).send()
})

