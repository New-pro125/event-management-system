import { PropsWithChildren, useEffect, useRef } from "react";

type InfiniteScrollProps = PropsWithChildren & {
  // hasNextPage?: boolean;
  onLoadMore?: () => void;
  threshold?: number;
};
export function InfiniteScroll({
  children,
  // hasNextPage,
  onLoadMore,
  threshold = 500,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          onLoadMore?.();
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` },
    );
    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }
    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [onLoadMore, threshold]);
  return (
    <>
      {children}
      <div ref={containerRef} className="h-1" />
    </>
  );
}
