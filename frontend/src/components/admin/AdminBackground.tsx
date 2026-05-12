import { memo } from "react";
import Silk from "../ui/Silk";

const AdminBackground = memo(function AdminBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={1.8} scale={1.4} color="#0d0209" noiseIntensity={0.8} rotation={0.3} />
            <div className="pointer-events-none absolute inset-0 bg-black/50" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(220,20,60,0.18),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(155,48,255,0.10),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-[var(--neutral-bg)]" />
        </div>
    );
});

export default AdminBackground;
