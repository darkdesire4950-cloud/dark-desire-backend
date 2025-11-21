import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { connectDB } from './config/db.js'
import { configureCloudinary } from './config/cloudinary.js'

const port = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    configureCloudinary()

    app.listen(port, () => {
      console.log(`Admin API running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to boot server', error)
    process.exit(1)
  }
}

startServer()

