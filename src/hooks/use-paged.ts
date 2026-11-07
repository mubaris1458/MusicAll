import { useEffect, useRef, useState } from "react";

/** Returns a value that only updates after `ms` of no changes (search typing). */
export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/** Renders a list in pages; grows when the sentinel scrolls near view. Resets when `resetKey` changes. */
export function usePaged(total: number, page = 40, resetKey?: unknown) {
  const [count, setCount] = useState(page);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => setCount(page), [resetKey, page]);
  useEffect(() => {
    const el = ref.current;
    if (!el || count >= total || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es[0]?.isIntersecting) setCount((c) => c + page); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [count, total, page]);
  return { count: Math.min(count, total), sentinel: ref, hasMore: count < total };
}
