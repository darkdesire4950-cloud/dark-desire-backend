## Dark Desire Admin API

Service layer for the admin panel powering products, categories, catalogs, media uploads, and inquiry emails.

### Stack
- Node.js + Express 5
- MongoDB via Mongoose
- Cloudinary for asset storage
- EmailJS REST API for contact/inquiry notifications

### Project Structure
```
src/
  app.js                # Express app + middleware
  server.js             # Bootstraps DB + cloud + server
  config/               # Mongo + Cloudinary configuration
  controllers/          # HTTP controllers
  services/             # Business logic & third-party integrations
  models/               # Mongoose schemas
  routes/               # Express routers per module
  validations/          # Joi schemas
  middleware/           # Error handling, validation helpers
  utils/                # Shared helpers (API response wrapper)
```

### Environment Variables
Copy `env.example` to `.env` and populate all keys:
- `PORT`, `MONGO_URI`, `CLIENT_ORIGIN`
- `CLOUDINARY_*` credentials
- `EMAILJS_*` credentials (public + private keys, service + template IDs)

### Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Nodemon development server |
| `npm start` | Production start |

### API Highlights
- `GET/POST /api/products` (status/search/pagination supported)
- `GET/POST /api/categories`
- `GET/POST /api/catalogs`
- `POST /api/media/single` & `/multiple` (multipart form-data with `file`/`files`) and `DELETE /api/media/:publicId`
- `POST /api/inquiries` (EmailJS proxy)

All payloads mirror the fields available in the admin UI (price label, SEO metadata, multi-image gallery, availability, MOQ, lead time, and flexible specifications).

