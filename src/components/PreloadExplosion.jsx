import { useEffect, useRef } from 'react';

export default function PreloadExplosion({ onFinish }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    let prevBodyOverflow, prevHtmlOverflow;
    try {
      // Prevent background scrolling while preloader is visible (html + body)
      prevBodyOverflow = document.body.style.overflow;
      prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } catch (e) {
      void e
    }
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) {
      try {
        // restore if we early-return
        document.body.style.overflow = prevBodyOverflow || '';
        document.documentElement.style.overflow = prevHtmlOverflow || '';
      } catch (e) {
        void e
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = null;
    let exploded = false;
    let finished = false;
    let explosionStartedAt = performance.now();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent || '');
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
    const particleCount = isMobile ? 34 : 86;

    let pw = window.innerWidth;
    let ph = window.innerHeight;

    const cx = () => pw / 2;
    const cy = () => ph / 2;
    const parts = [];
    const shock = { r: 0, max: Math.max(pw, ph) * 0.62, alpha: 0.98 };

    function resize() {
      pw = window.innerWidth;
      ph = window.innerHeight;
      shock.max = Math.max(pw, ph) * 0.62;
      canvas.style.width = pw + 'px';
      canvas.style.height = ph + 'px';
      canvas.width = Math.max(1, Math.floor(pw * dpr));
      canvas.height = Math.max(1, Math.floor(ph * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setFlash(val) {
      try {
        document.documentElement.style.setProperty('--arbx-preload-flash', String(val));
      } catch {
        // Best effort during teardown.
      }
    }

    function createExplosion() {
      parts.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 3.3 + 1.2) * (isMobile ? 0.72 : 1);
        const size = Math.random() * 4.2 + 0.8;
        const hue = 176 + Math.random() * 54;
        parts.push({
          x: cx(),
          y: cy(),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size,
          hue,
        });
      }
    }

    function finishNow() {
      if (finished) return;
      finished = true;
      try {
        // restore scrolling when preloader finishes
        document.body.style.overflow = prevBodyOverflow || '';
        document.documentElement.style.overflow = prevHtmlOverflow || '';
      } catch (e) {
        void e
      }
      overlay.style.transition = 'opacity 420ms ease-out, transform 420ms ease-out';
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.025)';
      setTimeout(() => setFlash(0), 420);
      setTimeout(() => {
        try {
          onFinish && onFinish();
        } catch {
          // Optional callback guard.
        }
      }, 420);
    }

    function doShake(now, intensity = 12, duration = 620) {
      const shakeStart = now;

      function shakeLoop(t) {
        const elapsed = t - shakeStart;
        const progress = Math.min(1, elapsed / duration);
        const amount = intensity * (1 - progress);
        const dx = (Math.random() - 0.5) * amount;
        const dy = (Math.random() - 0.5) * amount;
        overlay.style.transform = `translate(${dx}px, ${dy}px) scale(${1 + progress * 0.02})`;

        if (progress < 1 && !finished) {
          requestAnimationFrame(shakeLoop);
        } else {
          overlay.style.transform = '';
        }
      }

      requestAnimationFrame(shakeLoop);
    }

    function beginExplosion(now = performance.now()) {
      if (exploded || finished) return;
      exploded = true;
      explosionStartedAt = now;
      shock.r = 0;
      shock.alpha = 0.98;
      createExplosion();
      setFlash(1);
      doShake(now);

      const flashStart = performance.now();
      function fadeFlash() {
        const progress = (performance.now() - flashStart) / 760;
        setFlash(Math.max(0, 1 - progress));
        if (progress < 1 && !finished) requestAnimationFrame(fadeFlash);
      }
      fadeFlash();
    }

    function handlePointerDown() {
      beginExplosion();
    }

    function handleStartEvent() {
      beginExplosion();
    }

    function handleKey(event) {
      if (event.key === 'Escape') finishNow();
      if (event.key === 'Enter' || event.key === ' ') beginExplosion();
    }

    function drawIdleCore(now) {
      const pulse = 1 + Math.sin(now * 0.006) * 0.08;
      const coreRadius = Math.min(26, Math.max(12, pw * 0.01)) * pulse;
      const ringRadius = coreRadius * (2.05 + Math.sin(now * 0.003) * 0.12);

      const glow = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), coreRadius * 7.4);
      glow.addColorStop(0, 'rgba(235,255,252,1)');
      glow.addColorStop(0.12, 'rgba(0,245,255,0.92)');
      glow.addColorStop(0.42, 'rgba(0,170,190,0.24)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx(), cy(), coreRadius * 3.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx(), cy());
      ctx.rotate(now * 0.0015);
      ctx.strokeStyle = 'rgba(0,243,255,0.58)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([ringRadius * 0.28, ringRadius * 0.08]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.fillStyle = 'rgba(230,255,252,0.98)';
      ctx.beginPath();
      ctx.arc(cx(), cy(), Math.max(3, coreRadius * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }

    function drawExplosion(now) {
      const dt = (now - explosionStartedAt) / 1000;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx * (isMobile ? 0.85 : 1) * 14 * (0.46 + dt);
        p.y += p.vy * (isMobile ? 0.85 : 1) * 14 * (0.46 + dt);
        p.life -= 0.017 * (isMobile ? 0.95 : 1);

        const alpha = Math.max(0, Math.min(1, p.life));
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 7);
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 74%, ${alpha.toFixed(3)})`);
        grad.addColorStop(0.28, `hsla(${p.hue}, 95%, 62%, ${(alpha * 0.58).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - alpha) * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }

      shock.r += 245 * (isMobile ? 0.62 : 1);
      shock.alpha *= 0.94;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(170,255,245,${Math.max(0, shock.alpha * 0.14).toFixed(3)})`;
      ctx.lineWidth = 11 * (isMobile ? 0.8 : 1);
      ctx.arc(cx(), cy(), Math.min(shock.r, shock.max), 0, Math.PI * 2);
      ctx.stroke();

      if (dt > 0.95) finishNow();
    }

    function draw(now) {
      if (!exploded) {
        ctx.clearRect(0, 0, pw, ph);
        ctx.fillStyle = 'rgba(0,0,0,0.74)';
        ctx.fillRect(0, 0, pw, ph);
        drawIdleCore(now);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, pw, ph);
        drawExplosion(now);
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    overlay.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('preload:explode', handleStartEvent);
    const autoTimer = window.setTimeout(() => beginExplosion(), isMobile ? 120 : 650);
    raf = requestAnimationFrame(draw);

      return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(autoTimer);
      window.removeEventListener('resize', resize);
      overlay.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('preload:explode', handleStartEvent);
      try {
        document.body.style.overflow = prevBodyOverflow || '';
        document.documentElement.style.overflow = prevHtmlOverflow || '';
      } catch (e) {
        void e
      }
    };
  }, [onFinish]);

  return (
    <div ref={overlayRef} className="preload-overlay" aria-label="Entrada do site">
      <canvas ref={canvasRef} className="preload-canvas" />
    </div>
  );
}
