import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="mb-6 w-full max-w-6xl mx-auto bg-gray-900 text-gray-100 px-4 py-4 rounded-2xl shadow-xl border border-gray-700 relative">
      {/* Desktop menu */}
      <div className="hidden md:flex items-center justify-center gap-6">
        <NavLinks />
      </div>

      {/* Mobile hamburger toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden shadow-2xl  "
      >
        <span className=" text-lg font-bold text-sky-600">📂 Menu</span>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-lg flex flex-col gap-4 p-4 z-40">
          <NavLinks onClick={() => setIsOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function NavLinks({ onClick }) {
  return (
    <>
      <Link
        to="/"
        onClick={onClick}
        className="text-sky-600 transition-colors font-semibold"
      >
        🏠 Home
      </Link>
      <Link
        to="/img-resizer"
        onClick={onClick}
        className="text-sky-600 transition-colors font-semibold"
      >
        🤏🏼 Image Compress & Resizer
      </Link>
      <Link
        to="/img-simple-editor"
        onClick={onClick}
        className="text-sky-600 transition-colors font-semibold"
      >
        🖼️ Image Simple Editor
      </Link>
      <Link
        to="/bg-remover"
        onClick={onClick}
        className="text-sky-600 transition-colors font-semibold"
      >
        ✂️ Background Remover
      </Link>
    </>
  );
}
