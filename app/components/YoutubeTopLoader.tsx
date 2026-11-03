"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function YoutubeTopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When route changes, trigger YouTube-style loading bar
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(70);
    }, 150);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 350);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* YouTube Signature Red Bar with Glow Head */}
      <div
        className="h-[3px] bg-gradient-to-r from-red-600 via-rose-500 to-red-500 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px #ff0000, 0 0 5px #ff4e45",
        }}
      >
        {/* Glow bead on the tip */}
        <div className="absolute right-0 top-0 h-full w-24 bg-white/40 blur-xs" />
      </div>
    </div>
  );
}
