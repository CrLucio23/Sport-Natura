import { useRef, useEffect, useState } from 'react';

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d120f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#7ba36f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDraw(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    drawing.current = true;
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setIsEmpty(false);
  }

  function stopDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL('image/png'));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d120f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={150}
        style={{
          width: '100%',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          cursor: 'crosshair',
          touchAction: 'none'
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <button
        type="button"
        className="button secondary"
        onClick={clear}
        style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      >
        Cancella firma
      </button>
      {isEmpty && (
        <small style={{ opacity: 0.5, marginLeft: '0.75rem' }}>Firma nel riquadro sopra</small>
      )}
    </div>
  );
}