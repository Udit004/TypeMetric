"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Engine: any;
    engine: any;
    GODOT_JWT?: string;
  }
}

export default function GodotGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let resizeHandler: (() => void) | null = null;

    // JWT from your auth system
    const token = localStorage.getItem("token");
    window.GODOT_JWT = token || "";

    // Restore Next.js title
    document.title = "TypeMetric - Ludo";

    // Restore favicon
    let favicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null;

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = "/favicon.ico";

    const existingScript = document.getElementById(
      "godot-loader"
    ) as HTMLScriptElement | null;

    const initializeGodot = async () => {
      if (!canvasRef.current) return;

      try {
        const engine = new window.Engine({
          canvas: canvasRef.current,
        });

        window.engine = engine;

        await engine.startGame({
          executable: "/games/ludo/LudoOnline",
        });

        resizeHandler = () => {
          if (!canvasRef.current) return;

          canvasRef.current.width =
            canvasRef.current.clientWidth;

          canvasRef.current.height =
            canvasRef.current.clientHeight;
        };

        resizeHandler();

        window.addEventListener(
          "resize",
          resizeHandler
        );

        console.log("Godot loaded successfully");
      } catch (error) {
        console.error(
          "Failed to start Godot:",
          error
        );
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");

      script.id = "godot-loader";
      script.src = "/games/ludo/LudoOnline.js";
      script.async = true;

      script.onload = initializeGodot;

      document.body.appendChild(script);
    } else {
      initializeGodot();
    }

    return () => {
      if (resizeHandler) {
        window.removeEventListener(
          "resize",
          resizeHandler
        );
      }
    };
  }, []);

  return (
    <div className="w-full h-50vh overflow-hidden">
      <canvas
        ref={canvasRef}
        id="godot-canvas"
        className="w-full h-full block"
      />
    </div>
  );
}