"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  age: number;
}

const MAX_POINTS = 18;
const POINT_LIFETIME_MS = 500;

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const points: Point[] = [];
    let lastX = -1;
    let lastY = -1;

    function handlePointerMove(e: PointerEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
      points.push({ x: lastX, y: lastY, age: 0 });
      if (points.length > MAX_POINTS) points.shift();
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    let rafId: number;
    let lastFrameTime = performance.now();

    function frame(now: number) {
      const dt = now - lastFrameTime;
      lastFrameTime = now;
      ctx!.clearRect(0, 0, width, height);

      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.age += dt;
        if (p.age > POINT_LIFETIME_MS) {
          points.splice(i, 1);
          continue;
        }
        const life = 1 - p.age / POINT_LIFETIME_MS;
        const radius = 5 * life;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(240, 97, 4, ${life * 0.35})`;
        ctx!.fill();
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
