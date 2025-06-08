import { useCallback, useRef } from "react";

export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());
  const preloadedImage = useCallback(
    (src: string, priority: "high" | "low" = "low") => {
      if (preloadedImages.current.has(src)) return;
      preloadedImages.current.add(src);
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      if (priority === "high") link.fetchPriority = "high";
      document.head.appendChild(link);
    },
    [],
  );
  return { preloadedImage };
}
