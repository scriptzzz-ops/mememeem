import React, { useState, useRef, useEffect } from "react";
import { Download, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";


const MemeGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [imageMemeUrl, setImageMemeUrl] = useState(null);
  const [videoMemeUrl, setVideoMemeUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      ffmpegRef.current = createFFmpeg({ log: true });
      await ffmpegRef.current.load();
    };
    loadFFmpeg();
  }, []);

  const generateImageMeme = (imageFile) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = "50px Impact";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.textAlign = "center";

      ctx.fillText(topText.toUpperCase(), canvas.width / 2, 60);
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 60);

      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);

      setImageMemeUrl(canvas.toDataURL("image/png"));
    };

    img.src = URL.createObjectURL(imageFile);
  };

  const generateVideoMeme = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    setProcessing(true);

    const ff = ffmpegRef.current;
    ff.FS("writeFile", "input.mp4", await fetchFile(videoFile));

    await ff.run(
      "-i",
      "input.mp4",
      "-vf",
      `drawtext=text='${topText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=50,drawtext=text='${bottomText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-100`,
      "-c:a",
      "copy",
      "output.mp4"
    );

    const data = ff.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

    setVideoMemeUrl(url);
    setProcessing(false);

    if (videoRef.current) {
      videoRef.current.src = url;
    }
  };

  const downloadImageMeme = () => {
    if (!imageMemeUrl) return;
    const link = document.createElement("a");
    link.href = imageMemeUrl;
    link.download = "meme.png";
    link.click();
  };

  const downloadVideoMeme = () => {
    if (!videoMemeUrl) return;
    const link = document.createElement("a");
    link.href = videoMemeUrl;
    link.download = "meme.mp4";
    link.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meme Generator</h1>

      <input
        type="text"
        placeholder="Top text"
        value={topText}
        onChange={(e) => setTopText(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="text"
        placeholder="Bottom text"
        value={bottomText}
        onChange={(e) => setBottomText(e.target.value)}
        className="border p-2"
      />

      <div className="mt-4 flex gap-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => generateImageMeme(e.target.files[0])}
          />
          {imageMemeUrl && (
            <button
              onClick={downloadImageMeme}
              className="bg-blue-500 text-white px-4 py-2 mt-2 flex items-center gap-2"
            >
              <ImageIcon size={18} /> Download Image Meme
            </button>
          )}
        </div>AC

        <div>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
          <button
            onClick={generateVideoMeme}
            disabled={processing}
            className="bg-green-500 text-white px-4 py-2 mt-2 flex items-center gap-2"
          >
            <VideoIcon size={18} /> {processing ? "Processing..." : "Generate Video Meme"}
          </button>
          {videoMemeUrl && (
            <>
              <video
                ref={videoRef}
                controls
                className="mt-4 w-full max-w-lg border border-gray-300 rounded"
              />
              <button
                onClick={downloadVideoMeme}
                className="bg-purple-500 text-white px-4 py-2 mt-2 flex items-center gap-2"
              >
                <Download size={18} /> Download Video Meme
              </button>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default MemeGenerator;
