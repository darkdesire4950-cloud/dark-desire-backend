import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import catalogRoutes from './routes/catalogRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'
import inquiryRoutes from './routes/inquiryRoutes.js'
import customizationRoutes from './routes/customizationRoutes.js'
import blogRoutes from './routes/blogRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN?.split(',').map(url => url.trim()) || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/catalogs', catalogRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/customizations', customizationRoutes)
app.use('/api/blogs', blogRoutes)
// Register customization route before general inquiries to avoid route conflicts
app.use('/api/inquiries/customization', customizationRoutes) // For frontend submission
app.use('/api/inquiries', inquiryRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

