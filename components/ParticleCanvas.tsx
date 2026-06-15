'use client';

import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const SPACING = isMobile ? 40 : 30;
    let particles: { bx: number; by: number; x: number; y: number; vx: number; vy: number }[] = [];

    function init() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const cols = Math.ceil(canvas.width / SPACING);
      const rows = Math.ceil(canvas.height / SPACING);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          particles.push({ bx: c * SPACING + SPACING / 2, by: r * SPACING + SPACING / 2, x: c * SPACING + SPACING / 2, y: r * SPACING + SPACING / 2, vx: 0, vy: 0 });
        }
      }
    }

    function draw() {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        const dx = mouse.current.x - p.x, dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (1 - dist / 150) * 8;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }
        p.vx += (p.bx - p.x) * 0.07;
        p.vy += (p.by - p.y) * 0.07;
        p.vx *= 0.82; p.vy *= 0.82;
        p.x += p.vx; p.y += p.vy;
        const disp = Math.sqrt((p.x - p.bx) ** 2 + (p.y - p.by) ** 2);
        const t = Math.min(disp / 28, 1);
        const alpha = 0.1 + t * 0.75;
        const g = Math.round(80 + t * 152);
        const b = Math.round(40 + t * 83);
        const size = 1.2 + t * 2.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,${g},${b},${alpha})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    }

    init();
    draw();

    const onMove = (e: MouseEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const onLeave = () => { mouse.current.x = -9999; mouse.current.y = -9999; };
    const onTouch = (e: TouchEvent) => { mouse.current.x = e.touches[0].clientX; mouse.current.y = e.touches[0].clientY; };
    const onTouchEnd = () => { mouse.current.x = -9999; mouse.current.y = -9999; };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(init, 150); };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('touchmove', onTouch);
      document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
    />
  );
}
