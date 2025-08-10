# MemeForge - Secure Meme Generator

A professional meme generation platform with JWT authentication, rate limiting, and Cloudflare Workers deployment.

## 🚀 Features

- **JWT Authentication** - Secure user login/registration with JSON Web Tokens
- **Rate Limiting** - 10 requests per minute per user to prevent abuse
- **Image Memes** - Upload images and add text overlays with professional styling
- **Video Memes** - Process videos with text overlays (FFmpeg WASM integration ready)
- **Cloudflare Workers** - Edge deployment for global low-latency access
- **Secure Environment** - API keys and secrets properly managed
- **Professional UI** - Modern React interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

### Backend (Cloudflare Workers)
- **Cloudflare Workers** - Serverless edge computing
- **JWT Authentication** - Secure token-based auth
- **Canvas API** - Server-side image processing
- **Rate Limiting** - Built-in request throttling
- **KV Storage** - Optional persistent storage

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd memeforge
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
VITE_API_URL=http://localhost:8787
```

### 3. Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
wrangler login
```

## 🚀 Development

### Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Start Cloudflare Workers Development Server

```bash
wrangler dev workers/index.js --port 8787
```

The API will be available at `http://localhost:8787`

## 🔧 Configuration

### Environment Variables (Cloudflare Workers)

Set these in your Cloudflare Workers dashboard:

```bash
# Required
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional (defaults shown)
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Wrangler Configuration

Edit `wrangler.toml` to configure your deployment:

```toml
name = "memeforge-api"
main = "workers/index.js"
compatibility_date = "2024-01-01"

[vars]
# Set your environment variables here or in the dashboard
```

## 🚀 Deployment

### Deploy to Cloudflare Workers

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

### Deploy Frontend

Build and deploy the frontend to your preferred hosting service:

```bash
npm run build
# Upload the 'dist' folder to your hosting service
```

## 🔐 Security Features

### JWT Authentication
- Secure token-based authentication
- 24-hour token expiration
- Automatic token refresh handling
- Protected API routes

### Rate Limiting
- 10 requests per minute per authenticated user
- IP-based tracking with user identification
- Graceful error handling with retry information
- Optional KV storage for persistence

### Environment Security
- API keys stored in environment variables
- No sensitive data in client-side code
- Secure token transmission
- CORS properly configured

## 📝 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### GET `/api/auth/verify`
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer jwt-token-here
```

### Meme Generation Endpoints

#### POST `/api/generate/image`
Generate an image meme with text overlay.

**Headers:**
```
Authorization: Bearer jwt-token-here
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: Image file (PNG, JPG, GIF, max 50MB)
- `topText`: Top text for meme
- `bottomText`: Bottom text for meme

**Response:**
```json
{
  "downloadUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "previewUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "meme_1640995200000.png",
  "rateLimitInfo": {
    "remaining": 9,
    "limit": 10,
    "resetTime": 45
  }
}
```

#### POST `/api/generate/video`
Generate a video meme with text overlay.

**Note:** Video processing requires FFmpeg WASM implementation. Currently returns a 501 error with implementation guidance.

### Rate Limiting

#### GET `/api/rate-limit/status`
Check current rate limit status.

**Response:**
```json
{
  "rateLimitInfo": {
    "allowed": true,
    "remaining": 8,
    "limit": 10,
    "resetTime": 30
  }
}
```

## 🎨 Frontend Components

### Main Components
- **App.jsx** - Main application with authentication state
- **MemeGenerator.jsx** - Core meme creation interface
- **LoginPage.jsx** - Authentication form
- **AboutPage.jsx** - Feature documentation

### Services
- **authService.js** - JWT authentication handling
- **memeService.js** - Meme generation API calls

## 🔧 Development Notes

### Image Processing
- Uses HTML5 Canvas API for client-side preview
- Server-side processing with node-canvas in Workers
- Supports PNG, JPG, GIF formats
- Professional text styling with Impact font

### Video Processing
- Ready for FFmpeg WASM integration
- Placeholder implementation provided
- Supports MP4, MOV, AVI formats
- Text overlay positioning system

### Rate Limiting
- Implements sliding window algorithm
- Uses Cloudflare KV for persistence (optional)
- Graceful degradation to in-memory storage
- Per-user and per-IP tracking

## 🚨 Production Considerations

### Security
1. **Change JWT Secret** - Use a strong, unique secret in production
2. **Enable HTTPS** - Always use HTTPS in production
3. **Database Integration** - Replace in-memory storage with Cloudflare D1
4. **Input Validation** - Add comprehensive input sanitization
5. **File Upload Security** - Implement virus scanning and file validation

### Performance
1. **CDN Integration** - Use Cloudflare CDN for static assets
2. **Image Optimization** - Implement image compression
3. **Caching** - Add appropriate cache headers
4. **Monitoring** - Set up error tracking and performance monitoring

### Scalability
1. **KV Storage** - Use Cloudflare KV for rate limiting persistence
2. **D1 Database** - Migrate to Cloudflare D1 for user storage
3. **R2 Storage** - Use Cloudflare R2 for file storage
4. **Analytics** - Implement usage analytics

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**MemeForge** - Professional meme creation with enterprise-grade security 🚀