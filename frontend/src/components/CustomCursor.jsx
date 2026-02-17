import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

let isTouchDevice = function () {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export default function CustomCursor() {
    let [position, setPosition] = useState({ x: 0, y: 0 });
    let [isPressed, setIsPressed] = useState(false);
    let [isHidden, setIsHidden] = useState(isTouchDevice());
    let frameRef = useRef(null);
    let latestPositionRef = useRef({ x: 0, y: 0 });

    useEffect(function () {
        if (isTouchDevice()) {
            setIsHidden(true);
            return;
        }

        let handleMove = function (event) {
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

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mousedown", handleDown);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("mouseleave", handleLeave);
        window.addEventListener("mouseenter", handleEnter);

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
                        className="w-8 h-8 rounded-full border border-[var(--brand-primary)]/80 bg-[var(--brand-primary)]/15 backdrop-blur-[2px]"
                        animate={{
                            scale: isPressed ? 0.7 : 1,
                            borderColor: isPressed ? "rgba(220, 20, 60, 1)" : "rgba(220, 20, 60, 0.8)",
                            backgroundColor: isPressed ? "rgba(220, 20, 60, 0.35)" : "rgba(220, 20, 60, 0.15)"
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    />
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                            scaleX: isPressed ? 0.8 : 1,
                            scaleY: isPressed ? 0.8 : 1
                        }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    >
                        <div className="w-0.5 h-6 bg-[var(--brand-primary)] rounded-full" />
                        <div className="w-6 h-0.5 bg-[var(--brand-primary)] rounded-full absolute" />
                    </motion.div>
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            opacity: isPressed ? 0.3 : 0.16,
                            scale: isPressed ? 1.8 : 1.3
                        }}
                        transition={{ duration: 0.22 }}
                    >
                        <div className="w-10 h-10 rounded-full border border-[var(--brand-primary)]/80 blur-[1px] mx-auto my-auto" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

