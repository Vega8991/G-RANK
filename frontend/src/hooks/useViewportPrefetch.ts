import { useEffect, useRef, type RefCallback } from "react";
import { prefetchRoute, type RouteKey } from "../services/routePrefetch";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
    root: null,
    rootMargin: "160px 0px",
    threshold: 0.01
};

export function useViewportPrefetch<T extends Element = HTMLAnchorElement>(route: RouteKey): RefCallback<T> {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const observedElementRef = useRef<T | null>(null);

    const setRef: RefCallback<T> = function (node) {
        if (observerRef.current && observedElementRef.current) {
            observerRef.current.unobserve(observedElementRef.current);
        }

        observedElementRef.current = node;

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
    };

    useEffect(function () {
        return function () {
            observerRef.current?.disconnect();
            observerRef.current = null;
            observedElementRef.current = null;
        };
    }, []);

    return setRef;
}
