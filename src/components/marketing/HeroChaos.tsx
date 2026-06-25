"use client";

import { useEffect, useRef } from "react";

const ICONS: { svg: string; color: string }[] = [
  {
    color: "#e7eaf3",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8v8l8-8v8"/></svg>',
  },
  {
    color: "#e7eaf3",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>',
  },
  {
    color: "#ec4899",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="2" width="3" height="8" rx="1.5"/><path d="M19 8.5A1.5 1.5 0 1 0 20.5 10H19z"/><rect x="8" y="14" width="3" height="8" rx="1.5"/><path d="M5 15.5A1.5 1.5 0 1 1 3.5 14H5z"/><rect x="14" y="13" width="8" height="3" rx="1.5"/><path d="M15.5 19A1.5 1.5 0 1 0 14 20.5V19z"/><rect x="2" y="8" width="8" height="3" rx="1.5"/><path d="M8.5 5A1.5 1.5 0 1 1 10 3.5V5z"/></svg>',
  },
  {
    color: "#3b82f6",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 5 2.5v13L16 21 4 11l3-2 9 7V5z"/></svg>',
  },
  {
    color: "#6366f1",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M8 6V4h8v2"/></svg>',
  },
  {
    color: "#06b6d4",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  },
  {
    color: "#9aa3b8",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  },
  {
    color: "#f59e0b",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  },
];

const SIZE = 64;
const REPEL_RADIUS = 90;

interface IconItem {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  phase: number;
}

export function HeroChaos() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = field.getBoundingClientRect().width;
    let H = field.getBoundingClientRect().height;

    const items: IconItem[] = ICONS.map(({ svg, color }) => {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;top:0;left:0;
        width:${SIZE}px;height:${SIZE}px;
        display:grid;place-items:center;
        border-radius:14px;
        background:#161a25;
        border:1px solid #232838;
        color:${color};
        box-shadow:0 6px 18px rgba(0,0,0,0.35);
        will-change:transform;
      `;
      el.innerHTML = `<span style="width:30px;height:30px;display:grid;place-items:center;">${svg}</span>`;
      field.appendChild(el);
      return {
        el,
        x: Math.random() * Math.max(1, W - SIZE),
        y: Math.random() * Math.max(1, H - SIZE),
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 0.35,
        phase: Math.random() * Math.PI * 2,
      };
    });

    if (reduced) {
      items.forEach((it, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        it.x = 12 + col * ((W - SIZE - 24) / 3);
        it.y = 40 + row * (H - SIZE - 80);
        it.el.style.transform = `translate(${it.x}px,${it.y}px)`;
      });
      return;
    }

    const mouse = { x: -999, y: -999, active: false };

    function onMouseMove(e: MouseEvent) {
      const r = field!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    }
    function onMouseLeave() {
      mouse.active = false;
    }
    function onResize() {
      const r = field!.getBoundingClientRect();
      W = r.width;
      H = r.height;
    }

    field.addEventListener("mousemove", onMouseMove);
    field.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    let rafId: number;
    let t = 0;

    function tick() {
      t += 0.016;
      for (const it of items) {
        if (mouse.active) {
          const cx = it.x + SIZE / 2;
          const cy = it.y + SIZE / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = (1 - dist / REPEL_RADIUS) * 0.35;
            it.vx += (dx / dist) * force;
            it.vy += (dy / dist) * force;
          }
        }

        it.x += it.vx;
        it.y += it.vy;
        it.vx *= 0.985;
        it.vy *= 0.985;

        const speed = Math.sqrt(it.vx * it.vx + it.vy * it.vy);
        if (speed < 0.15) {
          it.vx += (Math.random() - 0.5) * 0.2;
          it.vy += (Math.random() - 0.5) * 0.2;
        }

        if (it.x <= 0) { it.x = 0; it.vx = Math.abs(it.vx); }
        else if (it.x >= W - SIZE) { it.x = W - SIZE; it.vx = -Math.abs(it.vx); }
        if (it.y <= 0) { it.y = 0; it.vy = Math.abs(it.vy); }
        else if (it.y >= H - SIZE) { it.y = H - SIZE; it.vy = -Math.abs(it.vy); }

        it.rot += it.vr;
        const pulse = 1 + Math.sin(t * 1.6 + it.phase) * 0.06;
        it.el.style.transform = `translate(${it.x.toFixed(2)}px,${it.y.toFixed(2)}px) rotate(${it.rot.toFixed(2)}deg) scale(${pulse.toFixed(3)})`;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      field.removeEventListener("mousemove", onMouseMove);
      field.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      items.forEach((it) => it.el.remove());
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className="relative h-[340px] overflow-hidden rounded-[9px]"
    />
  );
}
