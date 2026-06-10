import { useEffect, useRef } from 'react';
import { getAnimationDefault, getLowPerfDefault, isConstrainedDevice, prefersReducedMotion } from './performance';

export default function HologramBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // state
    let rafId = null;
    let running = true;
    const reducedMotion = prefersReducedMotion();

    // heuristics
    const isMobile = isConstrainedDevice();
    const cores = navigator.hardwareConcurrency || 4;

    // performance / low-perf heuristic (can be toggled with localStorage 'arbx:bgLowPerf')
    function getLowPerfFromStorageOrHeuristics() {
      try {
        const v = localStorage.getItem('arbx:bgLowPerf');
        if (v === '1') return true;
        if (v === '0') return false;
      } catch {
        // localStorage can be blocked in private or embedded contexts.
      }
      return getLowPerfDefault();
    }

    let lowPerf = getLowPerfFromStorageOrHeuristics();
    // When used on the auth page we force a very low-cost mode
    const isAuthBg = typeof className === 'string' && className.indexOf('auth-bg') !== -1;
    if (isAuthBg) lowPerf = true;

    // toggles via custom events
    function animationsEnabled() {
      try {
        const v = localStorage.getItem('arbx:bgAnimations');
        if (v === null) return getAnimationDefault();
        return v === '1';
      } catch {
        return getAnimationDefault();
      }
    }

    function handleAnimToggle(e) {
      const enabled = e && e.detail && typeof e.detail.enabled === 'boolean' ? e.detail.enabled : animationsEnabled();
      if (!enabled) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        canvas.style.opacity = '0';
      } else {
        canvas.style.opacity = '';
        if (!running) {
          running = true;
          lastTime = performance.now();
          rafId = requestAnimationFrame(loop);
        }
      }
    }

    function handleLowPerfToggle(e) {
      const enabled = e && e.detail && typeof e.detail.lowPerf === 'boolean' ? e.detail.lowPerf : getLowPerfFromStorageOrHeuristics();
      lowPerf = enabled;
      init();
    }

    window.addEventListener('arbx:bgAnimations', handleAnimToggle);
    window.addEventListener('arbx:bgLowPerf', handleLowPerfToggle);

    // initial animation state
    if (!animationsEnabled()) {
      running = false;
      canvas.style.opacity = '0';
    }

    // sizing + dpr
    let pw = window.innerWidth;
    let ph = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, lowPerf ? 1 : (isMobile ? 1.25 : 1.75));

    // fps cap
    let fpsCap = lowPerf ? (isMobile ? 16 : 24) : (isMobile ? 24 : (cores >= 8 ? 60 : 45));
    let frameInterval = 1000 / fpsCap;

    // geometry + objects
    let lines = [];
    let nodes = [];
    let transmissions = [];

    // pointer parallax
    let pointer = { x: 0.5, y: 0.5 };
    let pointerTarget = { x: 0.5, y: 0.5 };
    const pointerLerp = 0.06;

    function rand(min, max) { return Math.random() * (max - min) + min; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function createLine(i) {
      const pts = [];
      const angle = Math.random() * Math.PI * 2;
      const len = rand(0.35, 1.1) * Math.max(pw, ph) * 0.58;
      const segments = Math.floor(rand(6, 14));
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const radius = t * len;
        const px = pw / 2 + Math.cos(angle + t * rand(-0.8, 0.8)) * radius + rand(-24, 24);
        const py = ph * 0.48 + Math.sin(angle + t * rand(-0.7, 0.7)) * radius * 0.7 + rand(-16, 16);
        pts.push({ x: px, y: py });
      }
      return {
        id: 'L' + i,
        pts,
        speed: rand(0.06, 0.22) * (Math.random() < 0.5 ? -1 : 1),
        width: rand(lowPerf ? 0.8 : 1.6, lowPerf ? 2.2 : 4.4),
        hueOffset: rand(-8, 8),
        glintSeed: Math.random(),
        phase: Math.random() * 1000
      };
    }

    function getPointOnLine(pts, t) {
      if (t <= 0) return pts[0];
      if (t >= 1) return pts[pts.length - 1];
      const total = pts.length - 1;
      const seg = Math.floor(t * total);
      const local = (t * total) - seg;
      const a = pts[seg], b = pts[Math.min(seg + 1, pts.length - 1)];
      return { x: lerp(a.x, b.x, local), y: lerp(a.y, b.y, local) };
    }

    function init() {
      pw = window.innerWidth; ph = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, lowPerf ? 1 : (isMobile ? 1.25 : 1.75));
      fpsCap = lowPerf ? (isMobile ? 16 : 24) : (isMobile ? 24 : (cores >= 8 ? 60 : 45));
      frameInterval = 1000 / fpsCap;

      // further throttle for the auth page to reduce CPU/GPU pressure
      if (isAuthBg) {
        fpsCap = Math.min(fpsCap, 18);
        dpr = 1; // always render at 1x on auth for lower cost
        frameInterval = 1000 / fpsCap;
      }

      canvas.style.width = pw + 'px';
      canvas.style.height = ph + 'px';
      canvas.width = Math.max(1, Math.floor(pw * dpr));
      canvas.height = Math.max(1, Math.floor(ph * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // generate lines and nodes (lighter on auth page)
      let linesCount = lowPerf ? (isMobile ? 8 : 14) : Math.max(24, Math.floor((pw + ph) / 135));
      if (isAuthBg) linesCount = Math.min(linesCount, 8);
      lines = new Array(linesCount).fill(0).map((_, i) => createLine(i));

      nodes = [];
      const nodesPerLine = isAuthBg ? 2 : (lowPerf ? (isMobile ? 1 : 3) : 5);
      for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < nodesPerLine; j++) {
          nodes.push({
            lineIndex: i,
            t: Math.random(),
            speed: rand(0.06, 0.22) * (Math.random() < 0.5 ? -1 : 1),
            size: rand(1.1, 4.2) * (lowPerf ? 0.7 : 1),
            hueShift: rand(-6, 6)
          });
        }
      }

      // precompute deterministic transmissions between hubs (no per-frame random)
      transmissions = [];
      const hubs = Math.max(isMobile ? 2 : 4, Math.floor(pw / 330));
      for (let h = 0; h < hubs; h++) {
        const hx = lerp(pw * 0.12, pw * 0.88, h / (hubs - 1));
        const hy = ph * 0.18 + Math.sin(h * 0.45) * ph * 0.18;
        for (let t = 0; t < (lowPerf ? (isMobile ? 1 : 2) : 4); t++) {
          const angle = rand(0, Math.PI * 2);
          const tx = hx + Math.cos(angle) * (pw * rand(0.16, 0.58));
          const ty = hy + Math.sin(angle) * (ph * rand(0.08, 0.48));
          transmissions.push({ sx: hx, sy: hy, tx, ty, phase: Math.random() * 1000, speed: rand(0.3, 1.2) });
        }
      }
    }

    // drawing layers
    function drawBaseFlow(now) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(2,6,8,0.36)';
      ctx.fillRect(0, 0, pw, ph);

      const passes = lowPerf ? (isMobile ? 1 : 2) : 5;
      for (let p = 0; p < passes; p++) {
        const alpha = 0.055 + p * 0.014;
        ctx.beginPath();
        const cols = Math.max(6, Math.floor(pw / 160));
        for (let i = 0; i < cols; i++) {
          const x = (i / (cols - 1)) * pw;
          const amplitude = 8 + Math.sin((now * 0.0005) + i * 0.3 + p) * 18;
          const y = ph * 0.5 + Math.sin((now * 0.0008) + i * 0.25 + p * 0.6) * amplitude;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(10,220,200,${alpha})`;
        ctx.lineWidth = 0.8 + p * 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawHeroScaffold(now) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const cx = pw * 0.5 + (pointer.x - 0.5) * 34;
      const cy = ph * 0.46 + (pointer.y - 0.5) * 24;
      const maxR = Math.max(pw, ph) * 0.58;

      for (let i = 0; i < 6; i++) {
        const r = maxR * (0.16 + i * 0.12);
        const wobble = Math.sin(now * 0.0004 + i) * 0.12;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,243,255,${0.035 + i * 0.012})`;
        ctx.lineWidth = lowPerf ? 0.7 : 1.1 + i * 0.18;
        ctx.setLineDash(i % 2 ? [r * 0.08, r * 0.035] : [r * 0.16, r * 0.055, r * 0.025, r * 0.05]);
        ctx.arc(cx, cy, r, -Math.PI * (0.95 + wobble), Math.PI * (0.62 - wobble));
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const spokes = lowPerf ? 10 : 18;
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2 + now * 0.00008;
        const inner = maxR * 0.12;
        const outer = maxR * (0.48 + 0.08 * Math.sin(i + now * 0.0005));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100,255,235,${i % 3 === 0 ? 0.08 : 0.04})`;
        ctx.lineWidth = i % 3 === 0 ? 1.1 : 0.55;
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner * 0.72);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer * 0.72);
        ctx.stroke();
      }

      const scanY = (ph * 0.12) + ((now * 0.035) % (ph * 0.78));
      const scan = ctx.createLinearGradient(0, scanY - 36, 0, scanY + 36);
      scan.addColorStop(0, 'rgba(0,243,255,0)');
      scan.addColorStop(0.5, 'rgba(0,243,255,0.08)');
      scan.addColorStop(1, 'rgba(0,243,255,0)');
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 36, pw, 72);

      ctx.restore();
    }

    function drawLines(now) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // parallax translation for lines layer (subtle)
      const px = (pointer.x - 0.5) * 12;
      const py = (pointer.y - 0.5) * 8;
      ctx.translate(px, py);

      for (let i = 0; i < lines.length; i++) {
        const L = lines[i];
        ctx.beginPath();
        for (let k = 0; k < L.pts.length; k++) {
          const pt = L.pts[k];
          const wx = pt.x + Math.cos((now * 0.001) + (k * 0.42) + L.phase) * (4 + (i % 3));
          const wy = pt.y + Math.sin((now * 0.001) + (k * 0.3) + L.phase) * (2 + (i % 4) * 0.5);
          if (k === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        const baseAlpha = lowPerf ? 0.16 : 0.28;
        ctx.strokeStyle = `rgba(0,243,255,${baseAlpha})`;
        ctx.lineWidth = Math.max(0.5, L.width * (0.88 + 0.12 * Math.sin((now * 0.001) + L.phase)));
        ctx.stroke();

        // deterministic micro-glints driven by seed and time
        if (!lowPerf && Math.abs(Math.sin(now * 0.0007 + L.glintSeed * 10)) > 0.98) {
          const si = Math.floor((Math.abs(Math.sin(L.glintSeed * 10)) * (L.pts.length - 3))) + 1;
          const p1 = L.pts[si], p2 = L.pts[si + 1];
          const gx = lerp(p1.x, p2.x, 0.45 + 0.1 * Math.sin(now * 0.0009 + L.glintSeed));
          const gy = lerp(p1.y, p2.y, 0.45 + 0.1 * Math.cos(now * 0.0007 + L.glintSeed));
          const gsize = 1.6 + Math.abs(Math.sin(now * 0.001 + L.glintSeed)) * 2.2;
          const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gsize * 6);
          gg.addColorStop(0, 'rgba(235,255,252,0.98)');
          gg.addColorStop(0.3, 'rgba(120,255,230,0.42)');
          gg.addColorStop(1, 'rgba(80,180,160,0)');
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(gx, gy, gsize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawNodes(now, dt) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const L = lines[n.lineIndex];
        n.t += n.speed * dt * (0.6 + Math.sin(now * 0.0007) * 0.3);
        if (n.t > 1) n.t = 0; if (n.t < 0) n.t = 1;
        const pt = getPointOnLine(L.pts, n.t);
        const jitter = 1.2 + Math.sin((n.t * 40) + (now * 0.0009)) * 1.6;
        const x = pt.x + Math.cos(n.t * 40 + i) * jitter;
        const y = pt.y + Math.sin(n.t * 30 + i * 0.5) * jitter;
        const g = ctx.createRadialGradient(x, y, 0, x, y, n.size * 6);
        g.addColorStop(0, 'rgba(235,255,252,0.98)');
        g.addColorStop(0.3, 'rgba(90,255,225,0.64)');
        g.addColorStop(1, 'rgba(30,80,70,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fill();

        if (!lowPerf) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(0,240,255,0.10)`;
          ctx.arc(x, y, n.size * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawMap(now) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // subtle grid lines (static + wavering)
      ctx.strokeStyle = 'rgba(0,220,200,0.075)';
      ctx.lineWidth = lowPerf ? 0.55 : 0.75;
      const stepY = lowPerf ? 36 : 26;
      for (let y = ph * 0.08; y < ph * 0.92; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(pw * 0.06, y + Math.sin(now * 0.0006 + y * 0.01) * 6);
        ctx.lineTo(pw * 0.94, y + Math.cos(now * 0.0005 + y * 0.01) * 6);
        ctx.stroke();
      }

      // hubs and deterministic transmissions
      for (let i = 0; i < transmissions.length; i++) {
        const tr = transmissions[i];
        const t = (Math.sin((now * 0.0005) + tr.phase) * 0.5 + 0.5) * (0.2 + (Math.abs(Math.sin(tr.phase)) * 0.8));
        const x = lerp(tr.sx, tr.tx, t);
        const y = lerp(tr.sy, tr.ty, t);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,230,210,${0.045 + Math.abs(Math.sin(tr.phase + now * 0.0006)) * 0.055})`;
        ctx.lineWidth = 0.8 * (lowPerf ? 0.7 : 1);
        ctx.moveTo(tr.sx, tr.sy);
        ctx.quadraticCurveTo((tr.sx + x) / 2 + Math.cos(tr.phase * 0.01) * 40, (tr.sy + y) / 2 + Math.sin(tr.phase * 0.01) * 26, x, y);
        ctx.stroke();

        // hub glow
        const hubAlpha = 0.08 + Math.abs(Math.sin(tr.phase * 0.001 + now * 0.0007)) * 0.10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,230,210,${hubAlpha})`;
        ctx.arc(tr.sx, tr.sy, lowPerf ? 5 : 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGlow(now) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(pw / 2, ph / 2, 2, pw / 2, ph / 2, Math.max(pw, ph) * 0.6);
      g.addColorStop(0, 'rgba(0,245,255,0.16)');
      g.addColorStop(0.5, 'rgba(0,150,140,0.055)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, pw, ph);
      // deterministic soft lens flares based on time
      if (!lowPerf) {
        const flareCount = 1 + Math.floor((Math.abs(Math.sin(now * 0.0001)) * 2));
        for (let i = 0; i < flareCount; i++) {
          const angle = i * 2.1 + (now * 0.00009);
          const lx = pw * 0.5 + Math.cos(angle + i) * (pw * 0.28);
          const ly = ph * 0.5 + Math.sin(angle * 0.7 + i) * (ph * 0.18);
          const intensity = 0.12 * (0.6 + Math.abs(Math.sin(now * 0.0003 + i)));
          const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 220);
          rg.addColorStop(0, `rgba(255,255,255,${intensity.toFixed(3)})`);
          rg.addColorStop(0.18, `rgba(140,255,230,${(intensity * 0.6).toFixed(3)})`);
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rg;
          ctx.fillRect(lx - 220, ly - 220, 440, 440);
        }
      }
      ctx.restore();
    }

    // pointer handling
    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointerTarget.x = (e.clientX - rect.left) / rect.width;
      pointerTarget.y = (e.clientY - rect.top) / rect.height;
    }
    function handlePointerLeave() { pointerTarget.x = 0.5; pointerTarget.y = 0.5; }
    // avoid pointer listeners for the lightweight auth background
    if (!isMobile && !isAuthBg) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerleave', handlePointerLeave);
    }

    // animation
    let lastTime = performance.now();
    let lastFrame = performance.now();

    function loop(now) {
      if (!running) return;
      const elapsed = now - lastFrame;
      if (elapsed < frameInterval) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;
      lastFrame = now;

      // smooth pointer
      pointer.x = lerp(pointer.x, pointerTarget.x, pointerLerp);
      pointer.y = lerp(pointer.y, pointerTarget.y, pointerLerp);

      ctx.clearRect(0, 0, pw, ph);

      drawBaseFlow(now);
      // skip heavier layers on the auth background to reduce CPU usage
      if (!isAuthBg && !(lowPerf && isMobile)) {
        drawHeroScaffold(now);
        drawMap(now);
      }
      drawLines(now);
      drawNodes(now, dt);
      if (!isAuthBg && !(lowPerf && isMobile)) drawGlow(now);

      if (!reducedMotion) rafId = requestAnimationFrame(loop);
    }

    function onResize() { init(); }
    window.addEventListener('resize', onResize);
    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!running && animationsEnabled()) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    // do not generate or form recognisable text like 'kkk' — use abstract micro‑glints instead
    init();
    if (!reducedMotion) rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        if (!isMobile && !isAuthBg) {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerleave', handlePointerLeave);
        }
        window.removeEventListener('arbx:bgAnimations', handleAnimToggle);
        window.removeEventListener('arbx:bgLowPerf', handleLowPerfToggle);
    };
  }, []);

  return <canvas ref={canvasRef} className={`site-hologram-bg-canvas ${className}`} aria-hidden="true" />;
}
