import { memo } from "react";
import Silk from "../ui/Silk";

const LobbiesBackground = memo(function LobbiesBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={3} scale={1.2} color="#7a0e1e" noiseIntensity={1.5} rotation={0.3} />
            <div className="pointer-events-none absolute inset-0 bg-black/25" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(220,20,60,0.55),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(220,20,60,0.35),transparent_45%),radial-gradient(circle_at_50%_60%,rgba(180,10,40,0.25),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[var(--neutral-bg)]" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
                    backgroundSize: "100% 3px"
                }}
            />
        </div>
    );
});

export default LobbiesBackground;
