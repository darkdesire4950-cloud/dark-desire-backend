import Catalog from '../models/Catalog.js'
import { ApiError } from '../utils/ApiResponse.js'

export const getCatalogs = async ({ status }) => {
  const filter = {}
  if (status) filter.status = status

  const items = await Catalog.find(filter)
    .populate('products', 'name primaryImage category price rating reviews status')
    .sort({ createdAt: -1 })
  return { items, meta: { total: items.length } }
}

export const getCatalogById = async (id) => {
  const catalog = await Catalog.findById(id).populate(
    'products',
    'name primaryImage category price rating reviews status description features tags',
  )
  if (!catalog) {
    throw new ApiError(404, 'Catalog not found')
  }
  return catalog
}

export const createCatalog = async (payload) => {
  const catalog = await Catalog.create(payload)
  return await Catalog.findById(catalog._id)
    .populate('products', 'name primaryImage category price rating reviews status')
}

export const updateCatalog = async (id, payload) => {
  const catalog = await Catalog.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('products', 'name primaryImage category price rating reviews status')
  if (!catalog) {
    throw new ApiError(404, 'Catalog not found')
  }
  return catalog
}

export const deleteCatalog = async (id) => {
  const catalog = await Catalog.findByIdAndDelete(id)
  if (!catalog) {
    throw new ApiError(404, 'Catalog not found')
  }
  return catalog
}

