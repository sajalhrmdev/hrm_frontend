import { useEffect, useState } from "react";

export const useFakeProgress = (loading: boolean) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    let resetTimer: any;

    if (loading) {
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // 🔥 90 e stop
          return prev + 1; // smooth increase
        });
      }, 30); // 🔥 speed control (choto = fast, boro = slow)
    } else {
      // 🔥 complete to 100 smoothly
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);

            resetTimer = setTimeout(() => {
              setProgress(0);
            }, 300);

            return 100;
          }
          return prev + 2; // fast finish
        });
      }, 20);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(resetTimer);
    };
  }, [loading]);

  return progress;
};