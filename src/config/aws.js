import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ApiError } from '../utils/ApiResponse.js'

let s3Client

export const configureAWS = () => {
  const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env

  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error(
      'AWS environment variables are missing. Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET',
    )
  }

  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })

  return s3Client
}

export const getS3Client = () => {
  if (!s3Client) {
    throw new Error('AWS S3 client not configured. Call configureAWS() first.')
  }
  return s3Client
}

export const uploadToS3 = async (fileBuffer, fileName, mimeType = 'application/octet-stream') => {
  const s3 = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `dark-desire/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    })

    await s3.send(command)

    const fileKey = command.input.Key
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

    return {
      url,
      key: fileKey,
    }
  } catch (error) {
    throw new ApiError(500, 'Failed to upload file to S3', error.message)
  }
}

export const deleteFromS3 = async (fileKey) => {
  const s3 = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET

  if (!fileKey) {
    throw new ApiError(400, 'fileKey is required to delete an asset from S3')
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })

    await s3.send(command)
    return { key: fileKey, deleted: true }
  } catch (error) {
    throw new ApiError(500, 'Failed to delete file from S3', error.message)
  }
}
