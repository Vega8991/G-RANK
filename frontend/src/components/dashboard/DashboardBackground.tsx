import { memo } from "react";
import Silk from "../ui/Silk";

const DashboardBackground = memo(function DashboardBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={2.2} scale={1.5} color="#2a0810" noiseIntensity={0.9} rotation={0.6} />
            <div className="pointer-events-none absolute inset-0 bg-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(220,20,60,0.28),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(155,48,255,0.14),transparent_50%),radial-gradient(circle_at_60%_10%,rgba(220,20,60,0.12),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[var(--neutral-bg)]" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
                    backgroundSize: "100% 3px"
                }}
            />
        </div>
    );
});

export default DashboardBackground;
