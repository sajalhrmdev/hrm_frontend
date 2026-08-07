"use client";

import { useEffect, useState } from "react";

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 4,
        zIndex: 2000,
        width: `${progress}%`,
        background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
        boxShadow: "0 1px 6px rgba(79, 70, 229, 0.4)",
        transition: "width 0.1s ease-out",
      }}
    />
  );
};

export default ScrollProgressBar;
