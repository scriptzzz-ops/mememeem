/**
 * Meme Service
 * Handles meme generation API calls with authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class MemeService {
  /**
   * Get authorization header with JWT token
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authorization header for FormData requests
   * @returns {Object} Headers object with authorization (no content-type for FormData)
   */
  getAuthHeadersForFormData() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Generate image meme with text overlay
   * @param {File} imageFile - Image file to process
   * @param {string} topText - Top text for meme
   * @param {string} bottomText - Bottom text for meme
   * @returns {Promise<Object>} Generated meme data
   */
  async generateImageMeme(imageFile, topText, bottomText) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('topText', topText || '');
      formData.append('bottomText', bottomText || '');

      const response = await fetch(`${API_BASE_URL}/api/generate/image`, {
        method: 'POST',
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Image meme generation failed');
        error.status = response.status;
        error.rateLimitInfo = data.rateLimitInfo;
        error.retryAfter = data.retryAfter;
        throw error;
      }

      return {
        downloadUrl: data.downloadUrl,
        previewUrl: data.previewUrl,
        filename: data.filename,
        rateLimitInfo: data.rateLimitInfo,
      };
    } catch (error) {
      console.error('Image meme generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video meme with text overlay
   * @param {File} videoFile - Video file to process
   * @param {string} topText - Top text for meme
   * @param {string} bottomText - Bottom text for meme
   * @returns {Promise<Object>} Generated meme data
   */
  async generateVideoMeme(videoFile, topText, bottomText) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('topText', topText || '');
      formData.append('bottomText', bottomText || '');

      const response = await fetch(`${API_BASE_URL}/api/generate/video`, {
        method: 'POST',
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Video meme generation failed');
        error.status = response.status;
        error.rateLimitInfo = data.rateLimitInfo;
        error.retryAfter = data.retryAfter;
        throw error;
      }

      return {
        downloadUrl: data.downloadUrl,
        previewUrl: data.previewUrl,
        filename: data.filename,
        rateLimitInfo: data.rateLimitInfo,
      };
    } catch (error) {
      console.error('Video meme generation error:', error);
      throw error;
    }
  }

  /**
   * Check rate limit status
   * @returns {Promise<Object>} Rate limit information
   */
  async getRateLimitStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rate-limit/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get rate limit status');
      }

      return data;
    } catch (error) {
      console.error('Rate limit status error:', error);
      throw error;
    }
  }
}

export const memeService = new MemeService();