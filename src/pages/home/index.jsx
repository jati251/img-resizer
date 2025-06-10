import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-gray-900 mx-auto my-auto w-fit rounded-3xl shadow-xl text-gray-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-sky-700 tracking-tight">
            🛠️ Image Tools Hub
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Choose a tool below to start working with your images.
          </p>
        </header>

        <div className="grid grid-cols-1  gap-6">
          <Link
            to="/img-resizer"
            className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-sky-400 mb-2">
              🔧 Image Resizer
            </h2>
            <p className="text-gray-300">
              Quickly resize your images with precision and ease.
            </p>
          </Link>

          <Link
            to="/img-simple-editor"
            className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-sky-400 mb-2">
              🎨 Simple Image Editor
            </h2>
            <p className="text-gray-300">
              Add and customize logos on top of your images.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
