import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createCatalog,
  deleteCatalog,
  getCatalogById,
  getCatalogs,
  updateCatalog,
} from '../services/catalogService.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const listCatalogs = asyncHandler(async (req, res) => {
  const data = await getCatalogs(req.query)
  res.json(new ApiResponse(data, 'Catalogs retrieved'))
})

export const showCatalog = asyncHandler(async (req, res) => {
  const catalog = await getCatalogById(req.params.id)
  res.json(new ApiResponse(catalog, 'Catalog retrieved'))
})

export const createCatalogHandler = asyncHandler(async (req, res) => {
  const catalog = await createCatalog(req.body)
  res.status(201).json(new ApiResponse(catalog, 'Catalog created'))
})

export const updateCatalogHandler = asyncHandler(async (req, res) => {
  const catalog = await updateCatalog(req.params.id, req.body)
  res.json(new ApiResponse(catalog, 'Catalog updated'))
})

export const deleteCatalogHandler = asyncHandler(async (req, res) => {
  await deleteCatalog(req.params.id)
  res.status(204).send()
})

