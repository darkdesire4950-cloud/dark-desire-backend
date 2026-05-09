# Migration Architecture Diagrams

## Current Architecture (Before)
```
┌─────────────────────────────┐
│   Admin Panel / Frontend    │
└──────────────┬──────────────┘
               │
               ▼
        ┌────────────────┐
        │  Express API   │
        │                │
        │ • Upload       │
        │ • Delete       │
        │ • CRUD         │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │  Cloudinary    │
        │                │
        │ • Store images │
        │ • Serve images │
        └────────────────┘
```

## New Architecture (After)
```
┌─────────────────────────────┐
│   Admin Panel / Frontend    │
└──────────────┬──────────────┘
               │
               ▼
        ┌────────────────────────┐
        │    Express API         │
        │                        │
        │ • mediaService.js      │
        │   - Auto-detection     │
        │   - Dual deletion      │
        │ • Upload/Delete/CRUD   │
        └────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐        ┌──────────┐
    │ AWS S3 │        │Cloudinary│
    │        │        │          │
    │ NEW    │        │ LEGACY   │
    │Images  │        │Images    │
    └────────┘        └──────────┘
```

## Image Upload Flow

### NEW - S3 Upload
```
1. User selects image
   │
2. Frontend POST /api/media/single
   │
3. multer-s3 middleware
   │
4. Upload to AWS S3
   ├─ Bucket: dark-desire-images
   ├─ Key: dark-desire/timestamp-filename
   ├─ ACL: public-read
   │
5. Return response
   {
     "url": "https://bucket.s3.region.amazonaws.com/dark-desire/...",
     "s3Key": "dark-desire/...",
     "source": "s3"
   }
   │
6. Store in MongoDB
   {
     "url": "https://bucket.s3.region.amazonaws.com/...",
     "s3Key": "dark-desire/..."
   }
```

### LEGACY - Cloudinary (Still Works)
```
Old product in database:
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "..."
}
│
Display in frontend ✓
Delete via API ✓ (auto-detected)
```

## Image Deletion Flow

### Auto-Detection
```
Request: DELETE /api/media/{identifier}
   │
   ▼
Is it a Cloudinary URL?
   ├─ YES → Delete from Cloudinary using publicId
   └─ NO  → Is it an S3 key?
            ├─ YES → Delete from S3 using key
            └─ NO  → Error
```

### With Explicit Source
```
Request: DELETE /api/media/{identifier}?source=s3
   │
   ▼
Delete from S3 bucket using key
```

## Database Schema (Unchanged)

### Product Model
```javascript
productSchema = {
  name: String,
  category: String,
  price: String,
  
  // ← No changes to media schema!
  primaryImage: {
    url: String,      // Works for both S3 and Cloudinary
    s3Key: String,    // Optional, for S3 images
    publicId: String  // Optional, for Cloudinary images
  },
  
  gallery: [{
    url: String,
    s3Key: String,
    publicId: String
  }],
  
  // ... other fields
}
```

## API Response Flow

### Upload Response
```
Frontend uploads image
   │
   ▼
S3 Storage Handler (multer-s3)
   │
   ├─ file.location = "https://bucket.s3.region.amazonaws.com/..."
   ├─ file.key = "dark-desire/timestamp-filename"
   ├─ file.mimetype = "image/jpeg"
   │
   ▼
Controller formats response
   {
     "status": 201,
     "data": {
       "url": file.location,
       "s3Key": file.key,
       "mimeType": file.mimetype,
       "source": "s3"
     }
   }
   │
   ▼
Frontend receives S3 URL
   │
   ▼
Frontend stores in product
   {
     "url": "https://bucket.s3.region...",
     "s3Key": "dark-desire/..."
   }
```

## Detection Logic

### Storage Source Detection
```javascript
isCloudinaryUrl(url) {
  return url.includes('cloudinary.com') || 
         url.includes('res.cloudinary.com')
}

isS3Url(url) {
  return url.includes('.s3.') || 
         url.includes('s3.amazonaws.com')
}

// Usage in mediaService.deleteAsset()
if (isCloudinaryUrl(url)) {
  // Delete from Cloudinary
} else if (isS3Url(url)) {
  // Delete from S3
}
```

## Migration Path (Optional)

### Current State
```
Existing Products
├─ Product 1
│  ├─ primaryImage: Cloudinary URL ✓ Still works
│  └─ gallery: Cloudinary URLs ✓ Still works
│
└─ Product 2
   ├─ primaryImage: Cloudinary URL ✓ Still works
   └─ gallery: Cloudinary URLs ✓ Still works
```

### After Using S3
```
Existing Products (Unchanged)
├─ Product 1
│  ├─ primaryImage: Cloudinary URL ✓ Still works
│  └─ gallery: Cloudinary URLs ✓ Still works
│
New Products
└─ Product 3
   ├─ primaryImage: S3 URL ✓ New
   ├─ gallery: [S3 URLs] ✓ New
   └─ Notes: Can still add Cloudinary URLs if needed
```

### Gradual Migration (Optional Later)
```
Products After Migration
├─ Product 1: Migrated
│  ├─ primaryImage: S3 URL (migrated from Cloudinary)
│  └─ gallery: [S3 URLs] (migrated)
│
├─ Product 2: Migrated
│  ├─ primaryImage: S3 URL (migrated)
│  └─ gallery: [S3 URLs] (migrated)
│
└─ Product 3: Native S3
   ├─ primaryImage: S3 URL
   └─ gallery: [S3 URLs]
```

## Deployment View

### Production Setup
```
┌─────────────────────────────────┐
│   Cloudflare / CDN              │
└──────────────┬──────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────────┐    ┌──────────────┐
│ Frontend     │    │ Backend API  │
│ (Production) │    │ (Node.js)    │
└──────────────┘    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
            ┌────────────┐   ┌──────────┐
            │ AWS S3     │   │MongoDB   │
            │ Bucket     │   │Atlas     │
            └────────────┘   └──────────┘
```

## Comparison Table

| Aspect | Cloudinary (Old) | AWS S3 (New) | Result |
|--------|------------------|--------------|--------|
| Setup | 1 account | 1 bucket + IAM | S3 slightly more steps |
| Cost | Free 25GB | Free 1 year | Both free tier suitable |
| Speed | CDN optimized | Raw S3 | S3 needs CloudFront |
| Control | Limited | Full | S3 more control |
| Legacy | — | ✓ Still works | No migration pressure |
| New uploads | ✓ Was used | ✓ Now used | Clean separation |

## Environment Variables Impact

```
BEFORE:
┌─────────────────────────────┐
│ CLOUDINARY_CLOUD_NAME       │
│ CLOUDINARY_API_KEY          │
│ CLOUDINARY_API_SECRET       │
└─────────────────────────────┘
           ▼
    All uploads to Cloudinary

AFTER:
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ CLOUDINARY_* (3 vars)       │  │ AWS_* (4 vars)              │
│ For legacy image operations │  │ For new S3 uploads/deletes  │
└─────────────────────────────┘  └─────────────────────────────┘
           │                                   │
           ▼                                   ▼
    Old products still work           New products use S3
```

---

## Summary

✅ **Dual-storage approach** provides:
- Zero downtime for existing images
- Smooth transition to S3
- Auto-detection for operations
- Optional future migration
- Full backward compatibility
