import React, { useState } from "react";
import { removeBackground } from "@imgly/background-removal";

const BgRemover = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setProcessedImage(null); // Reset processed image on new file selection
      setError(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resultBlob = await removeBackground(image);
      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(resultUrl);
    } catch (e) {
      setError("Failed to process the image. Please try another one.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-gray-900 rounded-3xl shadow-xl text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Image Background Remover
          </h1>
          <p className="text-gray-400 mt-2">
            Upload an image to remove its background and get a transparent PNG.
          </p>
        </header>

        <main className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="flex flex-col items-center">
            <label
              htmlFor="file-upload"
              className="w-full max-w-md cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
            >
              {image ? "Change Image" : "Select an Image"}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
            />

            {error && <p className="text-red-500 mt-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
              <div className="flex flex-col items-center">
                {!isLoading && (
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    {processedImage ? "Processed" : "Original"} Image
                  </h3>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                    <p className="mt-2 text-gray-400">Processing...</p>
                  </div>
                ) : processedImage ? (
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt="Original"
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <p className="text-gray-500">No image selected</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {image && (
                <button
                  onClick={handleRemoveBackground}
                  disabled={!image || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Remove Background"}
                </button>
              )}
              {processedImage && (
                <a
                  href={processedImage}
                  download="transparent-image.png"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Download PNG
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BgRemover;
