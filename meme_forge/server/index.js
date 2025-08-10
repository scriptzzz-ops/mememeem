import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --------------------- SET FFMPEG PATHS ---------------------
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// --------------------- MULTER SETUP FOR VIDEO UPLOAD ---------------------
const upload = multer({ dest: "uploads/" });

// --------------------- HEALTH CHECK ---------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --------------------- IMAGE GENERATION (AI) ---------------------
app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({ image: imageUrl });
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// --------------------- VIDEO GENERATION (FFMPEG) ---------------------
app.post("/generate-video", upload.single("video"), (req, res) => {
  const { topText, bottomText } = req.body;
  const videoPath = req.file.path;

  if (!topText && !bottomText) {
    return res.status(400).json({ error: "At least one text (top or bottom) is required" });
  }

  const outputPath = `output/${Date.now()}_video.mp4`;

  // Ensure output directory exists
  fs.mkdirSync("output", { recursive: true });

  // Build FFmpeg drawtext filters
  let drawTextFilters = [];
  if (topText) {
    drawTextFilters.push(
      `drawtext=text='${topText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=20:borderw=2:bordercolor=black`
    );
  }
  if (bottomText) {
    drawTextFilters.push(
      `drawtext=text='${bottomText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-th-20:borderw=2:bordercolor=black`
    );
  }

  ffmpeg(videoPath)
    .videoFilters(drawTextFilters)
    .output(outputPath)
    .on("end", () => {
      res.download(outputPath, (err) => {
        if (err) console.error("Download error:", err);

        // Cleanup
        fs.unlinkSync(videoPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).json({ error: "Video processing failed" });
    })
    .run();
});

// --------------------- START SERVER ---------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
