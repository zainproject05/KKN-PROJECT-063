"use client";

import createGlobe from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GlobeMarker {
  location: [number, number];
  size: number;
}

interface GlobeProps {
  className?: string;
  speed?: number; // speed multiplier (e.g. 0, 0.5, 1, 2)
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: GlobeMarker[];
}

export function Globe({
  className,
  speed = 1,
  baseColor = [0.08, 0.15, 0.3],
  markerColor = [6 / 255, 182 / 255, 212 / 255],
  glowColor = [0.05, 0.12, 0.25],
  markers = [
    { location: [-7.7956, 110.3695], size: 0.12 }, // Yogyakarta central
    { location: [14.5995, 120.9842], size: 0.05 }, // Manila
    { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo
    { location: [31.2304, 121.4737], size: 0.05 }, // Shanghai
    { location: [51.5074, -0.1278], size: 0.06 },  // London
    { location: [40.7128, -74.006], size: 0.06 },   // New York
    { location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo
  ],
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);
  const [r, setR] = useState(0);
  const [width, setWidth] = useState(500); // Solid fallback size
  
  // Keep track of phi across recreations to prevent jumpiness
  const phiRef = useRef(0);

  // Resize handler using ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = (w: number) => {
      // Scale down slightly on very small viewports to maintain spacing
      const boundedWidth = Math.max(280, Math.min(650, w));
      setWidth(boundedWidth);
    };

    // Initial check
    updateSize(container.clientWidth || 500);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          updateSize(entry.contentRect.width);
        }
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 150);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || width === 0) return;

    const currentPhi = phiRef.current;

    const globe = createGlobe(canvasRef.current, {
      width: width * 2,
      height: width * 2,
      devicePixelRatio: 2,
      phi: currentPhi,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6.0,
      baseColor,
      markerColor,
      glowColor,
      markers,
      onRender: (state: any) => {
        if (pointerInteracting.current === null) {
          phiRef.current += 0.0035 * speed; // Use dynamic speed factor
        }
        state.phi = phiRef.current + r;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    if (canvasRef.current) {
      canvasRef.current.style.opacity = "1";
    }

    return () => {
      globe.destroy();
    };
  }, [width, speed, baseColor, markerColor, glowColor, markers, r]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[650px] flex items-center justify-center pointer-events-auto",
        className
      )}
    >
      <canvas
        className="opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] select-none cursor-grab"
        style={{ width, height: width, maxWidth: "100%", maxHeight: "100%" }}
        ref={canvasRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          );
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          updatePointerInteraction(null);
        }}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            updateMovement(e.touches[0].clientX);
          }
        }}
      />
    </div>
  );
}
