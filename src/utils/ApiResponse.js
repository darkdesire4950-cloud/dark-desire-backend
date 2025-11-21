export class ApiResponse {
  constructor(data, message = 'Success') {
    this.success = true
    this.message = message
    this.data = data
  }
}

export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.success = false
  }
}

