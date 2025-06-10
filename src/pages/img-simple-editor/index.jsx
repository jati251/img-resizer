import React, { useState, useRef, useEffect, useCallback } from "react";

// --- Constants & Helper Functions ---
const SELECTION_COLOR = "#0ea5e9";

// Generates a unique ID for layers
const generateId = () =>
  `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Reusable UI Components ---
const ControlSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}) => (
  <div className="flex flex-col space-y-2">
    <label
      htmlFor={label}
      className="text-sm font-medium text-gray-300 flex justify-between"
    >
      <span>{label}</span>
      <span>{Math.round(value)}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
    />
  </div>
);

const ImageSimpleEditor = () => {
  // --- State Management ---
  const [baseImage, setBaseImage] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [baseImageName, setBaseImageName] = useState("No image selected");

  // --- Refs for Interaction State ---
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const layerListRef = useRef(null); // Ref for the <ul> element for touch events
  const touchDragInfoRef = useRef({ id: null, index: -1 }); // Ref for touch drag state

  // Memoized reference to the currently selected layer object
  const selectedLayer = React.useMemo(
    () => layers.find((l) => l.id === selectedLayerId),
    [layers, selectedLayerId]
  );

  // --- Core Canvas Drawing Logic ---
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      ctx.save();
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate(layer.rotation);
      ctx.drawImage(
        layer.image,
        -layer.width / 2,
        -layer.height / 2,
        layer.width,
        layer.height
      );

      // Draw selection box if layer is selected
      if (layer.id === selectedLayerId) {
        ctx.strokeStyle = SELECTION_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          -layer.width / 2,
          -layer.height / 2,
          layer.width,
          layer.height
        );
      }
      ctx.restore();
    });
  }, [baseImage, layers, selectedLayerId]);

  // --- Effects ---
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      if (!baseImage || !canvas || !container) return;
      const aspectRatio = baseImage.width / baseImage.height;
      const containerWidth = container.clientWidth;
      canvas.width = containerWidth;
      canvas.height = containerWidth / aspectRatio;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [baseImage, redrawCanvas]);

  useEffect(() => {
    if (baseImage) {
      redrawCanvas();
    }
  }, [layers, selectedLayerId, redrawCanvas, baseImage]);

  // --- File & Layer Management ---
  const handleBaseImageLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBaseImage(img);
        setBaseImageName(file.name);
        setLayers([]);
        setSelectedLayerId(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const addLogoLayer = (e) => {
    const file = e.target.files[0];
    if (!file || !baseImage) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const maxLogoWidth = canvas.width * 0.4;
        const aspectRatio = img.width / img.height;
        let logoWidth = Math.min(img.width, maxLogoWidth);
        let logoHeight = logoWidth / aspectRatio;
        const newLayer = {
          id: generateId(),
          image: img,
          name: file.name,
          x: (canvas.width - logoWidth) / 2,
          y: (canvas.height - logoHeight) / 2,
          width: logoWidth,
          height: logoHeight,
          aspectRatio: aspectRatio,
          rotation: 0,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const updateLayer = (id, newProps) =>
    setLayers((l) =>
      l.map((layer) => (layer.id === id ? { ...layer, ...newProps } : layer))
    );
  const deleteLayer = (id) => {
    setLayers((l) => l.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // --- Layer Reordering Logic (Desktop + Mobile) ---
  const handleLayerDrop = (e, targetLayerId) => {
    e.preventDefault();
    const draggedLayerId = e.dataTransfer.getData("layerId");
    reorderLayers(draggedLayerId, targetLayerId);
  };

  const reorderLayers = (draggedId, targetId) => {
    if (draggedId === targetId) return;
    const draggedIndex = layers.findIndex((l) => l.id === draggedId);
    const targetIndex = layers.findIndex((l) => l.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLayers = [...layers];
    const [draggedItem] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedItem);
    setLayers(newLayers);
  };

  // --- Touch Event Handlers for Mobile Layer Reordering ---
  const handleTouchStart = (e, layerId) => {
    touchDragInfoRef.current = {
      id: layerId,
      index: layers.findIndex((l) => l.id === layerId),
    };
  };

  const handleTouchMove = (e) => {
    if (!touchDragInfoRef.current.id) return;
    e.preventDefault(); // Prevent scrolling the page

    const touchY = e.touches[0].clientY;
    const draggedId = touchDragInfoRef.current.id;

    const listItems = Array.from(layerListRef.current.children);
    const targetItem = listItems.find((item) => {
      const { top, bottom } = item.getBoundingClientRect();
      return touchY > top && touchY < bottom;
    });

    if (targetItem) {
      const targetId = targetItem.dataset.layerid;
      reorderLayers(draggedId, targetId);
    }
  };

  const handleTouchEnd = () => {
    touchDragInfoRef.current = { id: null, index: -1 };
  };

  // --- Canvas Interaction Logic ---
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  };

  const isPosOnLayer = (pos, layer) => {
    const layerCenterX = layer.x + layer.width / 2;
    const layerCenterY = layer.y + layer.height / 2;
    const dx = pos.x - layerCenterX;
    const dy = pos.y - layerCenterY;
    const rotatedX =
      dx * Math.cos(-layer.rotation) - dy * Math.sin(-layer.rotation);
    const rotatedY =
      dx * Math.sin(-layer.rotation) + dy * Math.cos(-layer.rotation);
    return (
      Math.abs(rotatedX) < layer.width / 2 &&
      Math.abs(rotatedY) < layer.height / 2
    );
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    let clickedLayer = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (isPosOnLayer(pos, layer)) {
        clickedLayer = layer;
        break;
      }
    }
    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: pos.x - clickedLayer.x,
        y: pos.y - clickedLayer.y,
      };
      canvasRef.current.style.cursor = "grabbing";
    } else {
      setSelectedLayerId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !selectedLayer) return;
    const pos = getMousePos(e.nativeEvent);
    updateLayer(selectedLayerId, {
      x: pos.x - dragStartRef.current.x,
      y: pos.y - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  const handleCanvasTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const pos = getTouchPos(e);
    let clickedLayer = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (isPosOnLayer(pos, layer)) {
        clickedLayer = layer;
        break;
      }
    }

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: pos.x - clickedLayer.x,
        y: pos.y - clickedLayer.y,
      };
    } else {
      setSelectedLayerId(null);
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!isDraggingRef.current || !selectedLayer) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    updateLayer(selectedLayerId, {
      x: pos.x - dragStartRef.current.x,
      y: pos.y - dragStartRef.current.y,
    });
  };

  const handleCanvasTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const currentSelection = selectedLayerId;
    setSelectedLayerId(null);
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = "watermarked-image.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setSelectedLayerId(currentSelection);
    }, 50);
  };

  // --- Render ---
  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl text-gray-100 flex flex-col items-center justify-center min-h-screen p-4 font-sans">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold text-sky-700 tracking-tight">
            Image Simple Editor
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Use the controls to add, reorder, and edit your logo layers.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700 flex flex-col space-y-6">
            {/* Step 1 & 2 */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-sky-400">
                Step 1: Base Image
              </h2>
              <label
                htmlFor="baseImageUpload"
                className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span>Choose Base Image</span>
              </label>
              <input
                id="baseImageUpload"
                type="file"
                className="sr-only"
                onChange={handleBaseImageLoad}
                accept="image/*"
              />
              <p
                className="text-gray-400 text-sm mt-2 truncate"
                title={baseImageName}
              >
                {baseImageName}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3 text-sky-400">
                Step 2: Add Logos
              </h2>
              <label
                htmlFor="logoUpload"
                className={`w-full cursor-pointer text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                  !baseImage
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add New Logo</span>
              </label>
              <input
                id="logoUpload"
                type="file"
                className="sr-only"
                onChange={addLogoLayer}
                accept="image/png"
                disabled={!baseImage}
              />
            </div>

            {/* Draggable Layers List */}
            <div className="flex-grow flex flex-col min-h-[150px]">
              <h2 className="text-xl font-semibold mb-3 text-sky-400">Layer</h2>
              <div className="bg-gray-900/50 p-2 rounded-lg flex-grow overflow-y-auto">
                {layers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No Logo/PNG added yet.
                  </p>
                ) : (
                  <ul ref={layerListRef} className="space-y-2">
                    {layers
                      .slice()
                      .reverse()
                      .map((layer) => (
                        <li
                          key={layer.id}
                          data-layerid={layer.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("layerId", layer.id)
                          }
                          onDrop={(e) => handleLayerDrop(e, layer.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onTouchStart={(e) => handleTouchStart(e, layer.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={`p-2 rounded-md flex items-center justify-between transition-all duration-150 touch-none ${
                            selectedLayerId === layer.id
                              ? "bg-sky-600"
                              : "bg-gray-700 hover:bg-gray-600"
                          } ${
                            selectedLayerId !== layer.id
                              ? "cursor-grab"
                              : "cursor-default"
                          }`}
                        >
                          <span className="truncate text-sm pr-2">
                            {layer.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(layer.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 p-1.5 rounded-md"
                            title="Delete Layer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Edit Controls */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-sky-400">
                Edit Selected Layer
              </h2>
              <div
                className={`p-4 rounded-lg bg-gray-900/50 space-y-4 transition-opacity ${
                  !selectedLayer ? "opacity-50" : ""
                }`}
              >
                <ControlSlider
                  label="Size"
                  value={selectedLayer?.width || 0}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    updateLayer(selectedLayerId, {
                      width: newWidth,
                      height: newWidth / selectedLayer.aspectRatio,
                    });
                  }}
                  min={20}
                  max={canvasRef.current ? canvasRef.current.width * 0.8 : 500}
                  step={1}
                  disabled={!selectedLayer}
                />
                <ControlSlider
                  label="Rotation"
                  value={
                    selectedLayer ? (selectedLayer.rotation * 180) / Math.PI : 0
                  }
                  onChange={(e) =>
                    updateLayer(selectedLayerId, {
                      rotation: (parseFloat(e.target.value) * Math.PI) / 180,
                    })
                  }
                  min={-180}
                  max={180}
                  step={1}
                  disabled={!selectedLayer}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700 flex items-center justify-center">
            <div
              ref={canvasContainerRef}
              className="w-full h-full flex items-center justify-center"
            >
              {baseImage ? (
                <canvas
                  ref={canvasRef}
                  className="touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                />
              ) : (
                <div className="text-center text-gray-500 min-h-[400px] flex items-center justify-center">
                  <p>Upload a base image to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDownload}
            disabled={!baseImage}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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
            Download Final Image
          </button>
        </div>
      </div>
    </div>
  );
};
export default ImageSimpleEditor;
