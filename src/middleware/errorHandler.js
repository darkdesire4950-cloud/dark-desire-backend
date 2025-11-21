import { ApiError } from '../utils/ApiResponse.js'

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`))
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const errors = err.errors || []
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: errors,
    details: errors, // Also include as 'details' for consistency with validation errors
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}

