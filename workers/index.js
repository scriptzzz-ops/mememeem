/**
 * Cloudflare Workers API for MemeForge
 * Handles JWT authentication, rate limiting, and meme generation
 */

import { createCanvas, loadImage } from 'canvas';
import jwt from '@tsndr/cloudflare-worker-jwt';

// Environment variables (set in Cloudflare Workers dashboard)
// JWT_SECRET - Secret key for JWT tokens
// RATE_LIMIT_REQUESTS - Number of requests per minute (default: 10)
// RATE_LIMIT_WINDOW - Time window in seconds (default: 60)

/**
 * CORS headers for all responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * In-memory user storage (in production, use Cloudflare KV or D1)
 * For demo purposes only - replace with proper database
 */
const USERS = new Map();

/**
 * Rate limiting storage using Cloudflare KV
 * Key format: rate_limit:{ip}:{userId}
 */
class RateLimiter {
  constructor(env) {
    this.env = env;
    this.requests = env.RATE_LIMIT_REQUESTS || 10;
    this.window = env.RATE_LIMIT_WINDOW || 60; // seconds
  }

  /**
   * Check if request is within rate limit
   * @param {string} key - Rate limit key (IP + user ID)
   * @returns {Promise<{allowed: boolean, remaining: number, resetTime: number}>}
   */
  async checkRateLimit(key) {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.window;
    
    // Get current requests from KV (if available) or use in-memory fallback
    let requests = [];
    try {
      if (this.env.RATE_LIMIT_KV) {
        const stored = await this.env.RATE_LIMIT_KV.get(`rate_limit:${key}`);
        if (stored) {
          requests = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('KV error, using in-memory fallback:', error);
    }

    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (requests.length >= this.requests) {
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + this.window;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: resetTime - now,
        limit: this.requests,
      };
    }

    // Add current request
    requests.push(now);

    // Store updated requests
    try {
      if (this.env.RATE_LIMIT_KV) {
        await this.env.RATE_LIMIT_KV.put(
          `rate_limit:${key}`,
          JSON.stringify(requests),
          { expirationTtl: this.window + 10 }
        );
      }
    } catch (error) {
      console.error('KV storage error:', error);
    }

    return {
      allowed: true,
      remaining: this.requests - requests.length,
      resetTime: this.window,
      limit: this.requests,
    };
  }
}

/**
 * JWT Authentication utilities
 */
class AuthService {
  constructor(secret) {
    this.secret = secret;
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {Promise<string>} JWT token
   */
  async generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    return await jwt.sign(payload, this.secret);
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded payload
   */
  async verifyToken(token) {
    try {
      const isValid = await jwt.verify(token, this.secret);
      if (!isValid) {
        throw new Error('Invalid token');
      }

      const payload = jwt.decode(token);
      
      // Check expiration
      if (payload.payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload.payload;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   * @param {Request} request - Request object
   * @returns {string|null} JWT token
   */
  extractToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

/**
 * Image meme generation using Canvas API
 * @param {ArrayBuffer} imageBuffer - Image file buffer
 * @param {string} topText - Top text
 * @param {string} bottomText - Bottom text
 * @returns {Promise<ArrayBuffer>} Generated meme as PNG buffer
 */
async function generateImageMeme(imageBuffer, topText, bottomText) {
  try {
    // Load the image
    const image = await loadImage(imageBuffer);
    
    // Create canvas with image dimensions
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Configure text style
    const fontSize = Math.max(image.width / 15, 20);
    ctx.font = `bold ${fontSize}px Impact, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 15;
    
    // Draw top text
    if (topText.trim()) {
      const x = image.width / 2;
      const y = fontSize;
      ctx.strokeText(topText.toUpperCase(), x, y);
      ctx.fillText(topText.toUpperCase(), x, y);
    }
    
    // Draw bottom text
    if (bottomText.trim()) {
      const x = image.width / 2;
      const y = image.height - fontSize;
      ctx.strokeText(bottomText.toUpperCase(), x, y);
      ctx.fillText(bottomText.toUpperCase(), x, y);
    }
    
    // Return PNG buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Image meme generation error:', error);
    throw new Error('Failed to generate image meme');
  }
}

/**
 * Video meme generation placeholder
 * In a real implementation, this would use FFmpeg WASM
 * @param {ArrayBuffer} videoBuffer - Video file buffer
 * @param {string} topText - Top text
 * @param {string} bottomText - Bottom text
 * @returns {Promise<ArrayBuffer>} Generated meme as MP4 buffer
 */
async function generateVideoMeme(videoBuffer, topText, bottomText) {
  // This is a placeholder - in production, you would:
  // 1. Use FFmpeg WASM to process the video
  // 2. Add text overlays using drawtext filter
  // 3. Return the processed video buffer
  
  throw new Error('Video meme generation not implemented in this demo. Use FFmpeg WASM for production.');
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} extra - Extra data to include
 * @returns {Response} Error response
 */
function errorResponse(message, status = 400, extra = {}) {
  return new Response(
    JSON.stringify({ error: message, ...extra }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
}

/**
 * Create success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response} Success response
 */
function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Initialize services
    const authService = new AuthService(env.JWT_SECRET || 'default-secret-change-in-production');
    const rateLimiter = new RateLimiter(env);

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check
      if (path === '/health') {
        return successResponse({ status: 'OK', message: 'MemeForge API is running' });
      }

      // Authentication routes
      if (path === '/api/auth/register') {
        if (request.method !== 'POST') {
          return errorResponse('Method not allowed', 405);
        }

        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
          return errorResponse('Name, email, and password are required');
        }

        if (password.length < 6) {
          return errorResponse('Password must be at least 6 characters long');
        }

        // Check if user already exists
        const existingUser = Array.from(USERS.values()).find(u => u.email === email);
        if (existingUser) {
          return errorResponse('User already exists with this email');
        }

        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
          id: userId,
          name,
          email,
          password, // In production, hash this password!
          createdAt: new Date().toISOString(),
        };

        USERS.set(userId, user);

        // Generate JWT token
        const token = await authService.generateToken(user);

        return successResponse({
          user: { id: user.id, name: user.name, email: user.email },
          token,
        });
      }

      if (path === '/api/auth/login') {
        if (request.method !== 'POST') {
          return errorResponse('Method not allowed', 405);
        }

        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
          return errorResponse('Email and password are required');
        }

        // Find user
        const user = Array.from(USERS.values()).find(u => u.email === email);
        if (!user || user.password !== password) {
          return errorResponse('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = await authService.generateToken(user);

        return successResponse({
          user: { id: user.id, name: user.name, email: user.email },
          token,
        });
      }

      if (path === '/api/auth/verify') {
        if (request.method !== 'GET') {
          return errorResponse('Method not allowed', 405);
        }

        const token = authService.extractToken(request);
        if (!token) {
          return errorResponse('No token provided', 401);
        }

        try {
          const payload = await authService.verifyToken(token);
          const user = USERS.get(payload.userId);
          
          if (!user) {
            return errorResponse('User not found', 401);
          }

          return successResponse({
            user: { id: user.id, name: user.name, email: user.email },
          });
        } catch (error) {
          return errorResponse('Invalid token', 401);
        }
      }

      // Protected routes - require authentication
      const token = authService.extractToken(request);
      if (!token) {
        return errorResponse('Authentication required', 401);
      }

      let currentUser;
      try {
        const payload = await authService.verifyToken(token);
        currentUser = USERS.get(payload.userId);
        if (!currentUser) {
          return errorResponse('User not found', 401);
        }
      } catch (error) {
        return errorResponse('Invalid token', 401);
      }

      // Rate limiting check
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `${clientIP}:${currentUser.id}`;
      const rateLimitResult = await rateLimiter.checkRateLimit(rateLimitKey);

      if (!rateLimitResult.allowed) {
        return errorResponse(
          'Rate limit exceeded',
          429,
          {
            rateLimitInfo: rateLimitResult,
            retryAfter: rateLimitResult.resetTime,
          }
        );
      }

      // Image meme generation
      if (path === '/api/generate/image') {
        if (request.method !== 'POST') {
          return errorResponse('Method not allowed', 405);
        }

        try {
          const formData = await request.formData();
          const imageFile = formData.get('image');
          const topText = formData.get('topText') || '';
          const bottomText = formData.get('bottomText') || '';

          if (!imageFile) {
            return errorResponse('Image file is required');
          }

          // Validate file size (max 50MB)
          if (imageFile.size > 50 * 1024 * 1024) {
            return errorResponse('File size must be less than 50MB');
          }

          // Validate file type
          if (!imageFile.type.startsWith('image/')) {
            return errorResponse('File must be an image');
          }

          // Generate meme
          const imageBuffer = await imageFile.arrayBuffer();
          const memeBuffer = await generateImageMeme(imageBuffer, topText, bottomText);

          // Create data URL for response
          const base64 = btoa(String.fromCharCode(...new Uint8Array(memeBuffer)));
          const dataUrl = `data:image/png;base64,${base64}`;

          return successResponse({
            downloadUrl: dataUrl,
            previewUrl: dataUrl,
            filename: `meme_${Date.now()}.png`,
            rateLimitInfo: rateLimitResult,
          });

        } catch (error) {
          console.error('Image generation error:', error);
          return errorResponse('Failed to generate image meme', 500);
        }
      }

      // Video meme generation
      if (path === '/api/generate/video') {
        if (request.method !== 'POST') {
          return errorResponse('Method not allowed', 405);
        }

        try {
          const formData = await request.formData();
          const videoFile = formData.get('video');
          const topText = formData.get('topText') || '';
          const bottomText = formData.get('bottomText') || '';

          if (!videoFile) {
            return errorResponse('Video file is required');
          }

          // Validate file size (max 50MB)
          if (videoFile.size > 50 * 1024 * 1024) {
            return errorResponse('File size must be less than 50MB');
          }

          // Validate file type
          if (!videoFile.type.startsWith('video/')) {
            return errorResponse('File must be a video');
          }

          // For demo purposes, return an error since FFmpeg WASM is complex to implement
          return errorResponse(
            'Video meme generation is not implemented in this demo. ' +
            'In production, use FFmpeg WASM to process videos with text overlays.',
            501
          );

        } catch (error) {
          console.error('Video generation error:', error);
          return errorResponse('Failed to generate video meme', 500);
        }
      }

      // Rate limit status
      if (path === '/api/rate-limit/status') {
        if (request.method !== 'GET') {
          return errorResponse('Method not allowed', 405);
        }

        return successResponse({
          rateLimitInfo: rateLimitResult,
        });
      }

      // Route not found
      return errorResponse('Route not found', 404);

    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};