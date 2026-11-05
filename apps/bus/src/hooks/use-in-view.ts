import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks whether an element intersects the viewport. Attach `ref` to the
 * element; `inView` is false until it is observed on screen.
 */
const useInView = <T extends Element>(options?: IntersectionObserverInit) => {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<T | null>(null);
  const { root = null, rootMargin, threshold } = options ?? {};

  const ref = useCallback((element: T | null) => setNode(element), []);

  useEffect(() => {
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root, rootMargin, threshold },
    );
    observer.observe(node);

    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect();
      setInView(false);
    };
  }, [node, root, rootMargin, threshold]);

  return { inView, ref };
};

export default useInView;
