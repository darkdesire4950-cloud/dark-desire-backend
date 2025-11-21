import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../services/productService.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const listProducts = asyncHandler(async (req, res) => {
  const data = await getProducts(req.query)
  res.json(new ApiResponse(data, 'Products retrieved'))
})

export const showProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id)
  res.json(new ApiResponse(product, 'Product retrieved'))
})

export const createProductHandler = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body)
  res.status(201).json(new ApiResponse(product, 'Product created'))
})

export const updateProductHandler = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body)
  res.json(new ApiResponse(product, 'Product updated'))
})

export const deleteProductHandler = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id)
  res.status(204).send()
})

