import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

let isTouchDevice = function (): boolean {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export default function CustomCursor() {
    let [position, setPosition] = useState({ x: 0, y: 0 });
    let [isPressed, setIsPressed] = useState(false);
    let [isHidden, setIsHidden] = useState(isTouchDevice());
    let frameRef = useRef<number | null>(null);
    let latestPositionRef = useRef({ x: 0, y: 0 });

    useEffect(function () {
        if (isTouchDevice()) {
            setIsHidden(true);
            return;
        }

        let handleMove = function (event: MouseEvent) {
            latestPositionRef.current = { x: event.clientX, y: event.clientY };

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

        let handleLeave = function () {
            setIsHidden(true);
        };

        let handleEnter = function () {
            setIsHidden(false);
        };

        window.addEventListener("mousemove", handleMove, { passive: true });
        window.addEventListener("mousedown", handleDown, { passive: true });
        window.addEventListener("mouseup", handleUp, { passive: true });
        window.addEventListener("mouseleave", handleLeave, { passive: true });
        window.addEventListener("mouseenter", handleEnter, { passive: true });

        return function () {
            if (frameRef.current != null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mousedown", handleDown);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("mouseleave", handleLeave);
            window.removeEventListener("mouseenter", handleEnter);
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
