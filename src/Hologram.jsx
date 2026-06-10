import { useState, useRef, useEffect } from 'react';
import { isConstrainedDevice, prefersReducedMotion } from './performance';

export default function Hologram() {
  const [motion, setMotion] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const canvasRef = useRef(null);
  const ticks = Array.from({ length: 36 }, (_, i) => i);
  const orbitalDots = Array.from({ length: 10 }, (_, i) => i);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceWork = prefersReducedMotion() || isConstrainedDevice();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, reduceWork ? 1 : 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let raf = null;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) {
        if (!reduceWork) raf = requestAnimationFrame(draw);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const size = Math.min(w, h);
      const outer = size * 0.43;
      const mid = outer * 0.68;
      const inner = outer * 0.36;
      const pulse = 0.5 + Math.sin(t * 0.028) * 0.5;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const halo = ctx.createRadialGradient(cx, cy, size * 0.08, cx, cy, outer * 1.28);
      halo.addColorStop(0, 'rgba(160,255,245,0.22)');
      halo.addColorStop(0.36, 'rgba(0,243,255,0.12)');
      halo.addColorStop(0.72, 'rgba(0,180,170,0.035)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, outer * 1.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(cx, cy);

      for (let i = 0; i < 46; i++) {
        const angle = (i / 46) * Math.PI * 2 + t * 0.002;
        const longTick = i % 6 === 0;
        const r1 = outer * (longTick ? 0.88 : 0.93);
        const r2 = outer * (longTick ? 1.02 : 0.99);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(120,255,245,${longTick ? 0.24 : 0.12})`;
        ctx.lineWidth = longTick ? 1.7 : 0.8;
        ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        ctx.stroke();
      }

      ctx.save();
      ctx.rotate(t * 0.006);
      for (let i = 0; i < 4; i++) {
        const r = outer * (0.42 + i * 0.16);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,243,255,${0.08 + i * 0.035})`;
        ctx.lineWidth = 1 + i * 0.55;
        ctx.setLineDash([r * 0.18, r * 0.055, r * 0.04, r * 0.075]);
        ctx.arc(0, 0, r, Math.PI * 0.1 * i, Math.PI * 1.82 + i * 0.18);
        ctx.stroke();
      }
      ctx.restore();
      ctx.setLineDash([]);

      ctx.save();
      ctx.rotate(t * -0.01);
      ctx.scale(1, 0.52);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(70,255,210,${0.05 + i * 0.018})`;
        ctx.lineWidth = 0.8 + i * 0.25;
        ctx.arc(0, 0, inner + i * outer * 0.12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.rotate(t * 0.018);
      const sweep = ctx.createRadialGradient(0, 0, 0, 0, 0, outer);
      sweep.addColorStop(0, 'rgba(0,243,255,0.16)');
      sweep.addColorStop(0.7, 'rgba(0,243,255,0.08)');
      sweep.addColorStop(1, 'rgba(0,243,255,0)');
      ctx.fillStyle = sweep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outer, -0.16, 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 18; i++) {
        const angle = t * 0.018 + (i / 18) * Math.PI * 2;
        const r = mid * (0.72 + 0.24 * Math.sin(t * 0.012 + i * 1.7));
        const ySquash = i % 2 === 0 ? 0.72 : 0.5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * ySquash;
        const glowSize = i % 5 === 0 ? 24 : 14;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glow.addColorStop(0, 'rgba(220,255,250,0.95)');
        glow.addColorStop(0.28, 'rgba(0,243,255,0.42)');
        glow.addColorStop(1, 'rgba(0,243,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, i % 5 === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.rotate(t * -0.004);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,243,255,${0.045 + pulse * 0.035})`;
        ctx.lineWidth = i % 2 === 0 ? 1.1 : 0.65;
        ctx.moveTo(Math.cos(angle) * inner * 0.55, Math.sin(angle) * inner * 0.55);
        ctx.lineTo(Math.cos(angle) * outer * 0.78, Math.sin(angle) * outer * 0.78);
        ctx.stroke();
      }
      ctx.restore();

      const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, outer * 0.32);
      coreGlow.addColorStop(0, 'rgba(255,255,255,0.58)');
      coreGlow.addColorStop(0.12, 'rgba(0,243,255,0.48)');
      coreGlow.addColorStop(0.44, 'rgba(0,243,255,0.12)');
      coreGlow.addColorStop(1, 'rgba(0,243,255,0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(0, 0, outer * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!reduceWork) {
        t += 1;
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || isConstrainedDevice()) return;

    let raf = null;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function animate() {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      setMotion({
        x: current.x * 52,
        y: current.y * 34,
        rotateX: current.y * -13,
        rotateY: current.x * 16,
      });

      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
      target.x = ((event.clientX / window.innerWidth) - 0.5) * 2;
      target.y = ((event.clientY / window.innerHeight) - 0.5) * 2;
      schedule();
    }

    function handlePointerLeave() {
      target.x = 0;
      target.y = 0;
      schedule();
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      className="hologram-tilt"
      aria-hidden="false"
    >
      <div
        className="holo-follow-layer"
        style={{
          transform: `translate3d(${motion.x}px, ${motion.y}px, 0) rotateX(${motion.rotateX}deg) rotateY(${motion.rotateY}deg)`,
        }}
      >
        <canvas ref={canvasRef} className="holo-canvas-main" />

        <div className="holo-core">
          <div className="holo-rings">
            <span className="ring ring-outer" aria-hidden="true" />
            <span className="ring ring-large" aria-hidden="true" />
            <span className="ring ring-scan" aria-hidden="true" />
            <span className="ring ring-mid" aria-hidden="true" />
            <span className="ring ring-small" aria-hidden="true" />
          </div>

          <div className="holo-sweep" aria-hidden="true" />
          <div className="holo-ticks" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="holo-tick" style={{ '--angle': `${tick * 10}deg` }} />
            ))}
          </div>
          <div className="holo-orbitals" aria-hidden="true">
            {orbitalDots.map((dot) => (
              <span
                key={dot}
                className="holo-orbital-dot"
                style={{ '--angle': `${dot * 36}deg`, '--delay': `${dot * -0.18}s` }}
              />
            ))}
          </div>
          <div className="holo-center" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
