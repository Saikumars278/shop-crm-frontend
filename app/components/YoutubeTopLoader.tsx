"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Extend window interface for global API access
declare global {
  interface Window {
    YouTubeLoader?: {
      start: () => void;
      done: () => void;
      set: (percent: number) => void;
    };
    __yt_interceptors_installed?: boolean;
  }
}

export default function YoutubeTopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Active requests counter and timer refs
  const activeRequestsRef = useRef(0);
  const trickleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentProgressRef = useRef(0);

  // Keep ref synchronized with state for interval calculations
  const updateProgress = useCallback((val: number | ((prev: number) => number)) => {
    setProgress((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      const clamped = Math.max(0, Math.min(100, next));
      currentProgressRef.current = clamped;
      return clamped;
    });
  }, []);

  // Stop trickle interval
  const stopTrickle = useCallback(() => {
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }
  }, []);

  // Stop safety timeout
  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // Finish and hide loader with smooth 100% burst and fade out
  const done = useCallback(() => {
    stopTrickle();
    clearSafetyTimeout();

    // Remove is-refreshing spin class from any spinning buttons
    if (typeof document !== "undefined") {
      document.querySelectorAll(".is-refreshing").forEach((el) => {
        el.classList.remove("is-refreshing");
      });
    }

    // Immediately push to 100%
    updateProgress(100);

    // After reaching 100%, start fade out
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);

      // Reset progress back to 0 after fade out finishes
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        updateProgress(0);
        activeRequestsRef.current = 0;
      }, 300);
    }, 200);
  }, [stopTrickle, clearSafetyTimeout, updateProgress]);

  // Start the YouTube loader and start trickling
  const start = useCallback(() => {
    // Clear any pending finish or reset
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

    setVisible(true);

    // If currently at 0, jump to initial progress
    if (currentProgressRef.current === 0 || currentProgressRef.current === 100) {
      updateProgress(24);
    }

    // Start trickle if not running
    if (!trickleIntervalRef.current) {
      trickleIntervalRef.current = setInterval(() => {
        updateProgress((prev) => {
          if (prev < 40) return prev + 6;
          if (prev < 70) return prev + 3;
          if (prev < 88) return prev + 1;
          return prev; // Never exceed 88% while trickling
        });
      }, 250);
    }

    // Safety timeout: automatically finish after 9 seconds if an API hangs
    clearSafetyTimeout();
    safetyTimeoutRef.current = setTimeout(() => {
      done();
    }, 9000);
  }, [updateProgress, clearSafetyTimeout, done]);

  // Set explicit percentage
  const set = useCallback(
    (percent: number) => {
      setVisible(true);
      updateProgress(percent);
    },
    [updateProgress]
  );

  // Expose global window API and custom events
  useEffect(() => {
    window.YouTubeLoader = {
      start,
      done,
      set,
    };

    const handleCustomStart = () => start();
    const handleCustomDone = () => done();

    window.addEventListener("yt-loader-start", handleCustomStart);
    window.addEventListener("yt-loader-done", handleCustomDone);

    return () => {
      window.removeEventListener("yt-loader-start", handleCustomStart);
      window.removeEventListener("yt-loader-done", handleCustomDone);
    };
  }, [start, done, set]);

  // Handle route navigation triggers
  useEffect(() => {
    // When route (pathname or searchParams) changes, complete the loader
    done();
  }, [pathname, searchParams, done]);

  // Global Interceptors: Fetch, XHR, Link Clicks, Form Submits, Refresh Buttons
  useEffect(() => {
    if (typeof window === "undefined" || window.__yt_interceptors_installed) return;
    window.__yt_interceptors_installed = true;

    // Helper to increment active operations
    const increment = () => {
      activeRequestsRef.current += 1;
      start();
    };

    // Helper to decrement active operations
    const decrement = () => {
      activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
      if (activeRequestsRef.current === 0) {
        done();
      }
    };

    // 1. Monkey-patch window.fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";

      // Ignore Next.js internal static chunk prefetching
      const isInternalPrefetch =
        url.includes("/_next/static/") ||
        url.includes("/favicon.ico") ||
        (args[1] &&
          typeof args[1].headers === "object" &&
          (args[1].headers as Record<string, string>)["next-router-prefetch"] === "1");

      if (!isInternalPrefetch) {
        increment();
      }

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        if (!isInternalPrefetch) {
          decrement();
        }
      }
    };

    // 2. Monkey-patch XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (...args: any[]) {
      return originalOpen.apply(this, args as any);
    };

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      increment();
      const onEnd = () => {
        decrement();
        this.removeEventListener("loadend", onEnd);
      };
      this.addEventListener("loadend", onEnd);
      return originalSend.apply(this, args as any);
    };

    // 3. Intercept Internal Link Clicks for Instant YouTube-Style Feedback
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // If clicked destination is different from current URL, start immediately
      const currentPath = window.location.pathname + window.location.search;
      if (href !== currentPath) {
        start();
      }
    };

    // 4. Intercept Form Submissions
    const handleFormSubmit = () => {
      increment();
      setTimeout(decrement, 2500); // safety fallback for forms
    };

    // 5. Intercept Buttons (Form Submits & Refresh Buttons)
    const handleButtonClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("button, [role='button']");
      if (!btn) return;

      const text = (btn.textContent || "").toLowerCase();
      const label = (btn.getAttribute("aria-label") || "").toLowerCase();
      const title = (btn.getAttribute("title") || "").toLowerCase();
      const className = (btn.className || "").toString().toLowerCase();

      // Check if button is a Refresh button
      const isRefresh =
        text.includes("refresh") ||
        label.includes("refresh") ||
        title.includes("refresh") ||
        className.includes("refresh") ||
        Boolean(btn.querySelector("svg, .lucide, [data-icon*='refresh']"));

      if (isRefresh) {
        btn.classList.add("is-refreshing");
        start();
      } else if (btn.getAttribute("type") === "submit" || btn.getAttribute("data-loading") === "true") {
        start();
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    document.addEventListener("click", handleButtonClick, true);
    document.addEventListener("submit", handleFormSubmit, true);

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
      document.removeEventListener("click", handleAnchorClick, true);
      document.removeEventListener("click", handleButtonClick, true);
      document.removeEventListener("submit", handleFormSubmit, true);
      window.__yt_interceptors_installed = false;
    };
  }, [start, done]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopTrickle();
      clearSafetyTimeout();
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [stopTrickle, clearSafetyTimeout]);

  if (!visible && progress === 0) return null;

  return (
    <div
      id="yt-progress-container"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-300 select-none"
      style={{ opacity: visible ? 1 : 0 }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* YouTube Signature Red Bar with Glow Tip and Trailing Glow */}
      <div
        id="yt-progress-bar"
        className="relative h-[3px] bg-[#ff0000] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px #ff0000, 0 0 5px #ff4e45",
        }}
      >
        {/* Glow Diffusion Wave on Bar Edge */}
        <div className="absolute right-0 top-0 h-full w-28 bg-gradient-to-r from-transparent via-white/30 to-white/70 blur-[2px] pointer-events-none" />

        {/* High-Intensity White Pinhead Glow at the Leading Edge */}
        <div className="absolute right-0 -top-[1.5px] h-[6px] w-[6px] rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_12px_#ff0000] pointer-events-none" />
      </div>
    </div>
  );
}
