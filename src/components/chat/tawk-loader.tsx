"use client";

import { useEffect } from "react";

const TAWK_EMBED_SRC = "https://embed.tawk.to/658867b870c9f2407f83115e/1hiedaa44";
const TAWK_SCRIPT_SELECTOR = 'script[data-tawk="true"]';
const TAWK_DELAY_MS = 5000;

type WindowWithTawk = Window & {
  Tawk_API?: unknown;
  Tawk_LoadStart?: Date;
};

export function TawkLoader() {
  useEffect(() => {
    const windowWithTawk = window as WindowWithTawk;
    const readyAt = Date.now() + TAWK_DELAY_MS;
    const interactionEvents: Array<keyof WindowEventMap> = [
      "scroll",
      "touchstart",
      "mousemove",
      "keydown",
    ];

    let timeoutId: number | null = null;
    let idleCallbackId: number | null = null;
    let didLoad = false;

    const removeListeners = () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onInteraction);
      });
    };

    const appendScript = () => {
      if (didLoad) {
        return;
      }

      if (windowWithTawk.Tawk_API || document.querySelector(TAWK_SCRIPT_SELECTOR)) {
        didLoad = true;
        removeListeners();
        return;
      }

      windowWithTawk.Tawk_API = windowWithTawk.Tawk_API ?? {};
      windowWithTawk.Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.async = true;
      script.charset = "UTF-8";
      script.src = TAWK_EMBED_SRC;
      script.setAttribute("crossorigin", "*");
      script.setAttribute("data-tawk", "true");
      document.body.appendChild(script);

      didLoad = true;
      removeListeners();
    };

    const load = () => {
      if (didLoad) {
        return;
      }

      if (typeof window.requestIdleCallback === "function") {
        idleCallbackId = window.requestIdleCallback(() => {
          appendScript();
        });
        return;
      }

      appendScript();
    };

    const tryLoad = () => {
      if (Date.now() >= readyAt) {
        load();
      }
    };

    function onInteraction() {
      tryLoad();
    }

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onInteraction, { passive: true });
    });

    timeoutId = window.setTimeout(() => {
      tryLoad();
    }, TAWK_DELAY_MS);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (idleCallbackId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleCallbackId);
      }
      removeListeners();
    };
  }, []);

  return null;
}
