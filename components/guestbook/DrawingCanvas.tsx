"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";

type DrawingCanvasProps = {
  onChange: (blob: Blob | null) => void;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;

export function DrawingCanvas({ onChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#2f2a26");
  const [size, setSize] = useState(8);
  const [isErasing, setIsErasing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fffaf0";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, []);

  function emitChange() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => onChange(blob), "image/png");
  }

  function getPoint(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (event.buttons !== 1) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = size;
    context.strokeStyle = isErasing ? "#fffaf0" : color;
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasDrawing(true);
  }

  function finishDrawing() {
    if (hasDrawing) {
      emitChange();
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#fffaf0";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setHasDrawing(false);
    onChange(null);
  }

  return (
    <div className="drawing-panel">
      <div className="drawing-toolbar" aria-label="그림 도구">
        <label>
          펜 색상
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label>
          굵기
          <input
            type="range"
            min="2"
            max="28"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
        </label>
        <button type="button" className={!isErasing ? "active" : ""} onClick={() => setIsErasing(false)}>
          펜
        </button>
        <button type="button" className={isErasing ? "active" : ""} onClick={() => setIsErasing(true)}>
          지우개
        </button>
        <button type="button" onClick={clearCanvas}>
          전체 지우기
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="drawing-canvas"
        aria-label="방명록 그림 그리기 캔버스"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={finishDrawing}
        onPointerLeave={finishDrawing}
      />
      <p className="helper-text">마우스, 터치, 펜으로 그림을 남길 수 있습니다.</p>
    </div>
  );
}
