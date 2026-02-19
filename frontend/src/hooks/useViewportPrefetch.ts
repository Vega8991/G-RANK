import { useCallback, useEffect, useRef, type RefCallback } from "react";
import { prefetchRoute, type RouteKey } from "../services/routePrefetch";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
    root: null,
    rootMargin: "160px 0px",
    threshold: 0.01
};

export function useViewportPrefetch<T extends Element = HTMLAnchorElement>(route: RouteKey): RefCallback<T> {
    const elementRef = useRef<T | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const setRef = useCallback<RefCallback<T>>(function (node) {
        if (observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
        }

        elementRef.current = node;

        if (!node) {
            return;
        }

        if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
            return;
        }

        if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    prefetchRoute(route);
                    observerRef.current?.unobserve(entry.target);
                });
            }, OBSERVER_OPTIONS);
        }

        observerRef.current.observe(node);
    }, [route]);

    useEffect(function () {
        return function () {
            observerRef.current?.disconnect();
            observerRef.current = null;
            elementRef.current = null;
        };
    }, []);

    return setRef;
}
