"use client";

import { useCallback, useEffect, useState } from "react";

interface PreviewMotionOptions {
  itemCount: number;
  intervalMs?: number;
  initialIndex?: number;
}

export function usePreviewMotion({
  itemCount,
  intervalMs = 3200,
  initialIndex = 0,
}: PreviewMotionOptions) {
  const [cursor, setCursor] = useState(() => Math.max(0, initialIndex));
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || itemCount < 2) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setCursor((current) => (current + 1) % itemCount);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, itemCount, paused, reducedMotion]);

  const togglePaused = useCallback(() => setPaused((current) => !current), []);
  const index = itemCount > 0 ? cursor % itemCount : 0;

  return {
    index,
    paused,
    reducedMotion,
    togglePaused,
  };
}
