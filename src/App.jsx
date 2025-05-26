import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export default function PDFResizer() {
  const [file, setFile] = useState(null);
  const [percent, setPercent] = useState(70);
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  async function handleCompress() {
    if (!file) return;

    setLoading(true);

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const scaleFactor = percent / 100;
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      copiedPage.scaleContent(scaleFactor, scaleFactor);
      newPdf.addPage(copiedPage);
    }

    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: "application/pdf" });
    saveAs(blob, "compressed_" + file.name);

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl space-y-4">
      <h2 className="text-xl font-bold">PDF Quality Resizer</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="w-full text-sm"
      />

      <div>
        <label className="block mb-1 text-sm font-medium">
          Resize by percentage:
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={percent}
          onChange={function (e) {
            setPercent(parseInt(e.target.value));
          }}
          className="w-full"
        />
        <span className="text-sm text-gray-600">{percent}%</span>
      </div>

      <button
        onClick={handleCompress}
        disabled={!file || loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
      >
        {loading ? "Processing..." : "Compress PDF"}
      </button>
    </div>
  );
}
