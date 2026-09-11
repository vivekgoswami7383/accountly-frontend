import { useCallback, useEffect, useRef } from 'react';

export default function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, loading: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback<IntersectionObserverCallback>(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading) onLoadMore();
    },
    [onLoadMore, hasMore, loading]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return sentinelRef;
}
