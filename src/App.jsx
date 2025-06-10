import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/home";
import ImageResizer from "./pages/img-resizer";
import ImageSimpleEditor from "./pages/img-simple-editor";

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="p-6">
      {!isHome && (
        <nav className="mb-6 w-fit max-w-6xl mx-auto bg-gray-900 text-gray-100 px-4 py-4 rounded-2xl shadow-xl border border-gray-700 flex items-center justify-center gap-4">
          <Link to="/" className="text-sky-600 transition-colors font-semibold">
            Home
          </Link>
          <Link
            to="/img-resizer"
            className="text-sky-600 transition-colors font-semibold"
          >
            Image Resizer
          </Link>
          <Link
            to="/img-simple-editor"
            className="text-sky-600 transition-colors font-semibold"
          >
            Image Simple Editor
          </Link>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/img-resizer" element={<ImageResizer />} />
        <Route path="/img-simple-editor" element={<ImageSimpleEditor />} />
      </Routes>
    </div>
  );
}
