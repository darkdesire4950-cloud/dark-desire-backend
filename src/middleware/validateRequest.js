import { ApiError } from '../utils/ApiResponse.js'

export const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const details = error.details.map((detail) => detail.message)
    return next(new ApiError(422, 'Validation failed', details))
  }

  req.body = value
  next()
}

