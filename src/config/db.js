import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

export const connectDB = async () => {
  const { MONGO_URI } = process.env

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing. Please set it in your environment variables.')
  }

  try {
    const conn = await mongoose.connect(MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

