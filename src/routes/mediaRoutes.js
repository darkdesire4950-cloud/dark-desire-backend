import { Router } from 'express'
import {
  handleDeleteAsset,
  handleMultipleUpload,
  handleSingleUpload,
} from '../controllers/mediaController.js'
import { upload } from '../services/mediaService.js'

const router = Router()

router.post('/single', upload.single('file'), handleSingleUpload)
router.post('/multiple', upload.array('files', 10), handleMultipleUpload)
router.delete('/:publicId', handleDeleteAsset)

export default router

