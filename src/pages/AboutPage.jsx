import React from "react";
import {
  ArrowLeft,
  Zap,
  Users,
  Download,
  Palette,
  Shield,
  Clock,
  Globe,
} from "lucide-react";

const AboutPage = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="container mx-auto max-w-5xl">
        {/* Top Navigation */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">About MemeForge</h1>
            <p className="text-gray-600">
              The secure, professional meme creation platform
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-10 text-center text-black shadow-lg mb-12 border border-gray-200">
          <div className="h-20 w-20 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Professional Meme Creation, Secured
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            MemeForge combines powerful meme creation tools with enterprise-grade security.
            JWT authentication, rate limiting, and Cloudflare Workers deployment ensure
            a fast, secure, and reliable experience.
          </p>
        </div>

        {/* Features */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            {
              icon: <Shield className="h-6 w-6 text-blue-600" />,
              bg: "bg-blue-100",
              title: "JWT Authentication",
              text: "Secure user authentication with JSON Web Tokens. Your account and creations are protected.",
            },
            {
              icon: <Clock className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
              title: "Rate Limiting",
              text: "Fair usage with 10 requests per minute per user. Prevents abuse and ensures quality service.",
            },
            {
              icon: <Palette className="h-6 w-6 text-purple-600" />,
              bg: "bg-purple-100",
              title: "Image & Video Memes",
              text: "Create memes from images (PNG/JPG/GIF) or videos (MP4/MOV/AVI) with text overlays.",
            },
            {
              icon: <Download className="h-6 w-6 text-pink-600" />,
              bg: "bg-pink-100",
              title: "High-Quality Downloads",
              text: "Download your memes as high-resolution PNG images or MP4 videos ready for sharing.",
            },
            {
              icon: <Globe className="h-6 w-6 text-indigo-600" />,
              bg: "bg-indigo-100",
              title: "Cloudflare Workers",
              text: "Lightning-fast global deployment with Cloudflare's edge network for optimal performance.",
            },
            {
              icon: <Zap className="h-6 w-6 text-yellow-600" />,
              bg: "bg-yellow-100",
              title: "FFmpeg Processing",
              text: "Professional video processing with FFmpeg WASM for seamless text overlay on videos.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${f.bg} rounded-lg`}>{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-10 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                color: "text-blue-600 bg-blue-100",
                title: "Secure Login",
                desc: "Authenticate with JWT tokens for secure access to the platform.",
              },
              {
                step: 2,
                color: "text-green-600 bg-green-100",
                title: "Upload Media",
                desc: "Upload images or videos (max 50MB) for your meme creation.",
              },
              {
                step: 3,
                color: "text-purple-600 bg-purple-100",
                title: "Add Text",
                desc: "Add top and bottom text with professional styling and positioning.",
              },
              {
                step: 4,
                color: "text-pink-600 bg-pink-100",
                title: "Download & Share",
                desc: "Get your high-quality meme as PNG or MP4 ready for social media.",
              },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4 ${s.color}`}
                >
                  <span className="text-lg font-bold">{s.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Specs */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Technical Specifications
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { 
                icon: <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />,
                title: "JWT Security", 
                desc: "Industry-standard authentication with secure token management" 
              },
              { 
                icon: <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />,
                title: "Rate Limiting", 
                desc: "10 requests/min per IP with intelligent throttling" 
              },
              { 
                icon: <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />,
                title: "Edge Deployment", 
                desc: "Cloudflare Workers for global low-latency access" 
              },
              { 
                icon: <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />,
                title: "WASM Processing", 
                desc: "Client-side FFmpeg for efficient video processing" 
              },
            ].map((spec, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                {spec.icon}
                <h3 className="font-semibold text-gray-900 mb-1">
                  {spec.title}
                </h3>
                <p className="text-xs text-gray-600">{spec.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-16">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">Security & Privacy</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🔒 Data Protection</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• All uploads are processed securely and temporarily</li>
                <li>• No permanent storage of user content</li>
                <li>• JWT tokens with secure expiration</li>
                <li>• Environment variables for API key protection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Performance</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Cloudflare Workers edge computing</li>
                <li>• Client-side video processing with WASM</li>
                <li>• Optimized file handling up to 50MB</li>
                <li>• Rate limiting for fair resource usage</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl shadow-md p-10 border border-gray-200">
          <div className="h-16 w-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Create Secure Memes?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Join the secure meme creation platform trusted by creators worldwide.
            Professional tools, enterprise security, global performance.
          </p>
          <button
            onClick={onBackToHome}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Creating Securely
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;