import { useEffect, useRef, useState } from 'react';

function HologramPanel() {
  const canvasRef = useRef(null);
  const [readings, setReadings] = useState({ temperature: 22.4, humidity: 45, sensorsOnline: 12 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let raf = null;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // rotating rings
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((t * Math.PI) / 180 / 8);
      for (let i = 6; i >= 1; i--) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,243,255,${0.03 + i * 0.02})`;
        ctx.lineWidth = 0.8 + i * 0.5;
        ctx.arc(0, 0, (Math.min(w, h) / 2) * (i / 6) * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // rotating points
      for (let i = 0; i < 12; i++) {
        const angle = t * 0.02 + (i / 12) * Math.PI * 2;
        const r = (Math.min(w, h) / 2) * 0.55 * (0.6 + 0.4 * Math.sin(t * 0.01 + i));
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * 0.45;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
        glow.addColorStop(0, 'rgba(0,243,255,0.9)');
        glow.addColorStop(1, 'rgba(0,243,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }

      ctx.restore();

      // center soft glow
      ctx.save();
      const grd = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.min(w, h) / 3);
      grd.addColorStop(0, 'rgba(0,243,255,0.18)');
      grd.addColorStop(1, 'rgba(0,243,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      t += 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const interval = setInterval(() => {
      setReadings(prev => ({
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.6).toFixed(1),
        humidity: Math.max(18, Math.min(92, Math.round(prev.humidity + (Math.random() - 0.5) * 2))),
        sensorsOnline: prev.sensorsOnline,
      }));
    }, 1200);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="hologram-section">
      <div className="hologram-wrapper">
        <canvas ref={canvasRef} className="hologram-canvas" />
        <div className="holo-overlay">
          <div className="holo-metrics">
            <div className="holo-card">
              <div className="label">Temperature</div>
              <div className="value">{readings.temperature}°C</div>
            </div>
            <div className="holo-card">
              <div className="label">Humidity</div>
              <div className="value">{readings.humidity}%</div>
            </div>
            <div className="holo-card">
              <div className="label">Sensors</div>
              <div className="value">{readings.sensorsOnline}</div>
            </div>
          </div>
        </div>
      </div>
      <p className="holo-caption">Simulated Holographic Control Panel — mock data for UI demo</p>
    </section>
  );
}

export default HologramPanel;
