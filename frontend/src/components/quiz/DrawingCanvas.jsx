import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Eraser, RotateCcw, Download, Palette } from 'lucide-react';

const COLORS = ['#000000', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
const BRUSH_SIZES = [2, 4, 6, 8, 12];

export default function DrawingCanvas({ onSave, width = 800, height = 500 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil'); // 'pencil' or 'eraser'
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Save initial state
    saveToHistory();
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e?.preventDefault();

    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const undo = () => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyIndex - 1];
    setHistoryIndex(prev => prev - 1);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob && onSave) {
        onSave(blob);
      }
    }, 'image/png');
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-answer.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-black border-2 border-white/20 p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 border-2 transition-all ${
              tool === 'pencil' 
                ? 'bg-white text-black border-white' 
                : 'border-white/30 text-white hover:border-white/60'
            }`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 border-2 transition-all ${
              tool === 'eraser' 
                ? 'bg-white text-black border-white' 
                : 'border-white/30 text-white hover:border-white/60'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-white/50 mr-1" />
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-white/30'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-1">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                brushSize === size 
                  ? 'border-white bg-white/10' 
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <div
                className="rounded-full bg-white"
                style={{ width: size, height: size }}
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 border-2 border-white/30 text-white hover:border-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="px-3 py-2 border-2 border-white/30 text-white hover:border-white/60 text-sm"
          >
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="p-2 border-2 border-white/30 text-white hover:border-white/60"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-2 border-white/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full cursor-crosshair touch-none bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={saveCanvas}
        className="w-full mt-4 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
      >
        Submit My Answer
      </motion.button>
    </div>
  );
}

