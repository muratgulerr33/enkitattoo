"use client";

import { RefObject, useEffect } from "react";

type UseHideHeaderOnScrollOptions = {
  headerRef: RefObject<HTMLElement | null>;
  contentRef?: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  fallbackHeight?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parsePx(rawValue: string) {
  const px = Number.parseFloat(rawValue);
  return Number.isFinite(px) ? px : 0;
}

export function useHideHeaderOnScroll({
  headerRef,
  contentRef,
  disabled = false,
  fallbackHeight = 112,
}: UseHideHeaderOnScrollOptions) {
  useEffect(() => {
    if (!headerRef.current) return;
    const headerElement = headerRef.current as HTMLElement;

    const rootStyle = document.documentElement.style;

    let rafId: number | null = null;
    let hideAmount = 0;
    let maxHide = fallbackHeight;
    let lastY = Math.max(window.scrollY, 0);

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const desktopQuery = window.matchMedia("(min-width: 80rem)");
    let prefersReducedMotion = reducedMotionQuery.matches;
    let isDesktop = desktopQuery.matches;

    function getContentEl() {
      return contentRef?.current ?? null;
    }

    function applyTransforms(offset: number) {
      const transform = `translate3d(0, -${offset}px, 0)`;
      headerElement.style.transform = transform;
      const contentEl = getContentEl();
      if (contentEl) {
        contentEl.style.transform = transform;
      }
    }

    function setVisible() {
      hideAmount = 0;
      applyTransforms(0);
    }

    function syncMeasuredHeights() {
      const measuredHeight = headerElement.getBoundingClientRect().height;
      maxHide = measuredHeight > 0 ? measuredHeight : fallbackHeight;

      const safeTopHost = headerElement.querySelector<HTMLElement>(
        "[data-mobile-safe-top]"
      );
      const safeTopInset = safeTopHost
        ? parsePx(window.getComputedStyle(safeTopHost).paddingTop)
        : 0;
      const stackHeight = Math.max(maxHide - safeTopInset, fallbackHeight);
      rootStyle.setProperty("--app-mobile-header-h", `${Math.round(stackHeight)}px`);

      hideAmount = clamp(hideAmount, 0, maxHide);
      applyTransforms(hideAmount);
    }

    function animationsDisabled() {
      return disabled || prefersReducedMotion || isDesktop;
    }

    function flushScrollFrame() {
      rafId = null;

      if (animationsDisabled()) {
        setVisible();
        lastY = Math.max(window.scrollY, 0);
        return;
      }

      const y = Math.max(window.scrollY, 0);
      if (y <= 0) {
        lastY = 0;
        setVisible();
        return;
      }

      const delta = y - lastY;
      lastY = y;

      if (delta === 0) return;

      hideAmount = clamp(hideAmount + delta, 0, maxHide);
      applyTransforms(hideAmount);
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(flushScrollFrame);
    }

    function onMotionChange(event: MediaQueryListEvent) {
      prefersReducedMotion = event.matches;
      if (animationsDisabled()) {
        setVisible();
      }
    }

    function onDesktopChange(event: MediaQueryListEvent) {
      isDesktop = event.matches;
      setVisible();
      lastY = Math.max(window.scrollY, 0);
    }

    headerElement.style.willChange = "transform";
    headerElement.style.transform = "translate3d(0, 0, 0)";
    const initialContentEl = getContentEl();
    if (initialContentEl) {
      initialContentEl.style.willChange = "transform";
      initialContentEl.style.transform = "translate3d(0, 0, 0)";
    }

    syncMeasuredHeights();
    setVisible();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncMeasuredHeights();
          })
        : null;
    resizeObserver?.observe(headerElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", onMotionChange);
    } else {
      reducedMotionQuery.addListener(onMotionChange);
    }
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", onDesktopChange);
    } else {
      desktopQuery.addListener(onDesktopChange);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", onMotionChange);
      } else {
        reducedMotionQuery.removeListener(onMotionChange);
      }
      if (typeof desktopQuery.removeEventListener === "function") {
        desktopQuery.removeEventListener("change", onDesktopChange);
      } else {
        desktopQuery.removeListener(onDesktopChange);
      }

      resizeObserver?.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      headerElement.style.willChange = "";
      headerElement.style.transform = "";
      const finalContentEl = getContentEl();
      if (finalContentEl) {
        finalContentEl.style.willChange = "";
        finalContentEl.style.transform = "";
      }
    };
  }, [headerRef, contentRef, disabled, fallbackHeight]);
}
