import React, { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Video as VideoIcon, AlertCircle, Loader2 } from 'lucide-react';
import { memeService } from '../services/memeService';

/**
 * Main Meme Generator Component
 * Handles both image and video meme creation with text overlays
 */
const MemeGenerator = () => {
  // State management for the meme generator
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'video'
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Refs for file input and preview
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  /**
   * Handle file selection and validation
   * Supports images (PNG, JPG, GIF) and videos (MP4, MOV, AVI)
   */
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setError('');
    setGeneratedMeme(null);

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    // Determine file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? 'image' : 'video');

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    if (previewRef.current) {
      if (isImage) {
        previewRef.current.src = previewUrl;
        previewRef.current.style.display = 'block';
      } else {
        previewRef.current.src = previewUrl;
        previewRef.current.style.display = 'block';
      }
    }
  };

  /**
   * Generate meme with text overlay
   * Calls the appropriate service based on file type
   */
  const generateMeme = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!topText.trim() && !bottomText.trim()) {
      setError('Please enter at least one text (top or bottom)');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedMeme(null);

    try {
      let result;
      
      if (fileType === 'image') {
        // Generate image meme
        result = await memeService.generateImageMeme(selectedFile, topText, bottomText);
      } else {
        // Generate video meme
        result = await memeService.generateVideoMeme(selectedFile, topText, bottomText);
      }

      setGeneratedMeme(result);
      
      // Update rate limit info if provided
      if (result.rateLimitInfo) {
        setRateLimitInfo(result.rateLimitInfo);
      }

    } catch (err) {
      console.error('Meme generation error:', err);
      
      // Handle rate limiting
      if (err.status === 429) {
        setError(`Rate limit exceeded. Try again in ${err.retryAfter || 60} seconds.`);
        setRateLimitInfo(err.rateLimitInfo);
      } else if (err.status === 401) {
        setError('Authentication failed. Please login again.');
        // Redirect to login
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        setError(err.message || 'Failed to generate meme. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Download the generated meme
   */
  const downloadMeme = () => {
    if (!generatedMeme?.downloadUrl) return;

    const link = document.createElement('a');
    link.href = generatedMeme.downloadUrl;
    link.download = generatedMeme.filename || `meme.${fileType === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Meme</h2>
        <p className="text-gray-600">Upload an image or video, add text, and generate your meme!</p>
      </div>

      {/* Rate Limit Info */}
      {rateLimitInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              Rate limit: {rateLimitInfo.remaining}/{rateLimitInfo.limit} requests remaining. 
              Resets in {Math.ceil(rateLimitInfo.resetTime / 60)} minutes.
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - File Upload & Controls */}
        <div className="space-y-4">
          {/* File Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">1. Upload Media</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
            >
              <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="text-gray-600 group-hover:text-purple-600 font-medium">
                Click to upload image or video
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Supports: PNG, JPG, GIF, MP4, MOV, AVI (max 50MB)
              </p>
            </button>

            {selectedFile && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                <p className="font-medium text-gray-700">Selected: {selectedFile.name}</p>
                <p className="text-gray-500">
                  Type: {fileType} • Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Text Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">2. Add Text</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{topText.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{bottomText.length}/100</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateMeme}
            disabled={isGenerating || !selectedFile || (!topText.trim() && !bottomText.trim())}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              isGenerating || !selectedFile || (!topText.trim() && !bottomText.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating {fileType} meme...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {fileType === 'image' ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <VideoIcon className="h-5 w-5" />
                )}
                <span>Generate {fileType ? fileType.charAt(0).toUpperCase() + fileType.slice(1) : ''} Meme</span>
              </div>
            )}
          </button>
        </div>

        {/* Right Column - Preview & Download */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
            
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {selectedFile ? (
                fileType === 'image' ? (
                  <img
                    ref={previewRef}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{ display: 'none' }}
                  />
                ) : (
                  <video
                    ref={previewRef}
                    controls
                    className="max-w-full max-h-full object-contain"
                    style={{ display: 'none' }}
                  />
                )
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload a file to see preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Generated Meme */}
          {generatedMeme && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Generated Meme</h3>
              
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {fileType === 'image' ? (
                  <img
                    src={generatedMeme.previewUrl || generatedMeme.downloadUrl}
                    alt="Generated meme"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={generatedMeme.previewUrl || generatedMeme.downloadUrl}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              <button
                onClick={downloadMeme}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download {fileType === 'image' ? 'PNG' : 'MP4'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Upload an image or video file (max 50MB)</li>
          <li>2. Add your top and/or bottom text</li>
          <li>3. Click generate to create your meme</li>
          <li>4. Download the result as PNG (images) or MP4 (videos)</li>
        </ol>
        <p className="text-xs text-blue-700 mt-2">
          <strong>Rate Limit:</strong> 10 requests per minute per user to ensure fair usage.
        </p>
      </div>
    </div>
  );
};

export default MemeGenerator;