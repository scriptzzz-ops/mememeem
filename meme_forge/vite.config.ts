import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": "http://localhost:3001",
      "/generate-meme": "http://localhost:3001"
    }
  },
  optimizeDeps: {
    include: ["@ffmpeg/ffmpeg"]
  }
});
