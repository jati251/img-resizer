import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/home";
import ImageResizer from "./pages/img-resizer";
import ImageSimpleEditor from "./pages/img-simple-editor";
import BgRemover from "./pages/bg-remover";
import Navbar from "./components/Navbar";

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="p-6">
      {!isHome && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/img-resizer" element={<ImageResizer />} />
        <Route path="/img-simple-editor" element={<ImageSimpleEditor />} />
        <Route path="/bg-remover" element={<BgRemover />} />
      </Routes>
    </div>
  );
}
