import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const isTouchDevice = function (): boolean {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPressed, setIsPressed] = useState(false);
    const [isHidden, setIsHidden] = useState(isTouchDevice());
    const frameRef = useRef<number | null>(null);
    const latestPositionRef = useRef({ x: 0, y: 0 });
    const hiddenRef = useRef(isTouchDevice());

    useEffect(function () {
        hiddenRef.current = isHidden;
    }, [isHidden]);

    useEffect(function () {
        if (isTouchDevice()) {
            setIsHidden(true);
            return;
        }

        let handleMove = function (event: MouseEvent) {
            latestPositionRef.current = { x: event.clientX, y: event.clientY };
            if (hiddenRef.current) {
                setIsHidden(false);
            }

            if (frameRef.current == null) {
                frameRef.current = requestAnimationFrame(function () {
                    frameRef.current = null;
                    setPosition(latestPositionRef.current);
                });
            }
        };

        let handleDown = function () {
            setIsPressed(true);
        };

        let handleUp = function () {
            setIsPressed(false);
        };

        let handleVisibility = function () {
            setIsHidden(document.hidden);
        };

        window.addEventListener("mousemove", handleMove, { passive: true });
        window.addEventListener("mousedown", handleDown, { passive: true });
        window.addEventListener("mouseup", handleUp, { passive: true });
        document.addEventListener("visibilitychange", handleVisibility);

        return function () {
            if (frameRef.current != null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mousedown", handleDown);
            window.removeEventListener("mouseup", handleUp);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    if (isHidden) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
            <div
                className="fixed z-[9999]"
                style={{
                    left: position.x,
                    top: position.y
                }}
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                        className="w-3 h-3 rounded-full bg-white"
                        style={{ boxShadow: "0 0 10px rgba(255,255,255,1), 0 0 4px rgba(255,255,255,0.9), 0 0 2px rgba(0,0,0,0.6)" }}
                        animate={{
                            scale: isPressed ? 0.5 : 1
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    />
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: 28,
                            height: 28,
                            top: -8,
                            left: -8,
                            border: "2px solid rgba(255,255,255,0.85)",
                            boxShadow: "0 0 8px rgba(255,255,255,0.4), inset 0 0 4px rgba(255,255,255,0.1), 0 0 3px rgba(0,0,0,0.5)"
                        }}
                        animate={{
                            scale: isPressed ? 0.6 : 1,
                            opacity: isPressed ? 1 : 0.85
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 24 }}
                    />
                </div>
            </div>
        </div>
    );
}
