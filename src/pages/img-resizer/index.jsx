import React, { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";

const ImageResizer = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [displayUrl, setDisplayUrl] = useState(null); // single display URL
  const [originalSize, setOriginalSize] = useState(null); // size in KB
  const [processedSize, setProcessedSize] = useState(null); // size in KB
  const [percent, setPercent] = useState(100);
  const [quality, setQuality] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const [originalResolution, setOriginalResolution] = useState(null);
  const [processedResolution, setProcessedResolution] = useState(null);

  useEffect(() => {
    if (!originalFile) {
      setDisplayUrl(null);
      setOriginalSize(null);
      setProcessedSize(null);
      return;
    }
    const url = URL.createObjectURL(originalFile);
    setDisplayUrl(url);
    setOriginalSize((originalFile.size / 1024).toFixed(2)); // KB
    setProcessedSize(null); // reset processed size

    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setOriginalFile(e.target.files[0]);
      setError(null);
    }
  }

  async function processImage() {
    if (!originalFile) return;
    setLoading(true);
    try {
      const img = new Image();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        img.onload = async () => {
          setOriginalResolution({ width: img.width, height: img.height });
          const maxDim = Math.max(img.width, img.height);
          const scale = percent / 100;
          const maxWidthOrHeight = maxDim * scale;

          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight,
            initialQuality: quality,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(originalFile, options);
          setProcessedSize((compressedFile.size / 1024).toFixed(2)); // KB processed file size

          const compressedImg = new Image();
          compressedImg.onload = () => {
            const canvas = canvasRef.current;
            let cw = compressedImg.width;
            let ch = compressedImg.height;

            setProcessedResolution({ width: cw, height: ch });

            if (rotation === 90 || rotation === 270) {
              canvas.width = ch;
              canvas.height = cw;
            } else {
              canvas.width = cw;
              canvas.height = ch;
            }

            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(compressedImg, -cw / 2, -ch / 2);
            ctx.restore();

            const finalDataUrl = canvas.toDataURL("image/jpeg", quality);
            setDisplayUrl(finalDataUrl);
          };

          compressedImg.src = URL.createObjectURL(compressedFile);
        };

        img.src = e.target.result;
      };

      fileReader.readAsDataURL(originalFile);
    } catch (err) {
      setError("Error processing image: " + err.message);
    }
    setLoading(false);
  }

  function downloadImage() {
    if (!displayUrl) return;
    const a = document.createElement("a");
    a.href = displayUrl;
    a.download = originalFile
      ? "processed_" + originalFile.name
      : "processed_image.jpg";
    a.click();
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-gray-900  rounded-3xl shadow-xl space-y-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-center text-sky-700 mb-4">
          Image Resizer & Compressor
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          simple tool to resize/compress image quality
        </p>
      </header>

      <div className="flex flex-col space-y-3">
        <label className="block text-sky-300 font-semibold mb-1">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file:border-0 file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded-full file:cursor-pointer hover:file:bg-indigo-700 transition"
        />
      </div>

      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-3">
        <div className="flex flex-col">
          <label className="font-semibold text-sky-300 mb-1">
            Resize <span className="text-sky-400">{percent}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={percent}
            onChange={(e) => setPercent(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-sky-300 mb-1">
            Quality <span className="text-sky-400">{quality.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Rotation</label>
          <select
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="border border-sky-300 rounded-md px-3 py-3 text-sky-600 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 w-full"
            aria-label="Select rotation angle"
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      </div>

      <button
        onClick={processImage}
        disabled={!originalFile}
        className="w-full py-3 rounded-full bg-indigo-600 text-white disabled:text-gray-700 text-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-600 transition"
      >
        Process Image
      </button>

      {error && (
        <p className="text-red-600 text-center font-semibold">{error}</p>
      )}

      {displayUrl && (
        <div className="text-center">
          {originalResolution && processedResolution && (
            <div className="mt-2 text-gray-700 font-semibold text-center">
              <p>
                Original Resolution:{" "}
                <span className="text-sky-600">
                  {originalResolution.width} ×{" "}
                </span>
                <span className="text-sky-600">
                  {originalResolution.height}
                </span>
              </p>
              <p>
                Processed Resolution:{" "}
                <span className="text-sky-600">
                  {processedResolution.width} ×{" "}
                </span>
                <span className="text-sky-600">
                  {processedResolution.height}
                </span>
              </p>
            </div>
          )}
          <p className="mb-2 font-semibold text-gray-700">
            Original size:{" "}
            <span className="text-sky-600">{originalSize} KB</span> | Processed
            size:{" "}
            <span className="text-sky-600">
              {processedSize ? processedSize + " KB" : "-"}
            </span>
          </p>
          {loading ? (
            <div className="flex justify-center items-center my-12">
              <svg
                className="animate-spin h-10 w-10 text-sky-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : (
            <img
              src={displayUrl}
              alt="Uploaded or processed preview"
              className="mx-auto rounded-lg shadow-lg max-w-full border border-sky-300"
            />
          )}

          <button
            onClick={downloadImage}
            className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Image
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default ImageResizer;
