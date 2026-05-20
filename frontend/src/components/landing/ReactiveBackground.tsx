import LightPillar from '../ui/LightPillar';
import { LightPillarPresets } from '../ui/lightPillarPresets';

export default function ReactiveBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(220,20,60,0.15),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(147,51,234,0.12),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(14,165,233,0.12),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(220,20,60,0.10),transparent_50%)] opacity-60 mix-blend-screen" />

            <div className="absolute inset-0">
                <LightPillar
                    {...LightPillarPresets.crimson}
                    interactive={false}
                    className="opacity-80"
                />
            </div>

            <div
                className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-[radial-gradient(circle,rgba(220,20,60,0.3),transparent_60%)] blur-[50px] md:blur-[80px]"
                style={{
                    top: "10%",
                    left: "5%",
                    opacity: 0.6
                }}
            />
            <div
                className="absolute w-36 h-36 sm:w-52 sm:h-52 md:w-80 md:h-80 bg-[radial-gradient(circle,rgba(14,165,233,0.25),transparent_60%)] blur-[50px] md:blur-[80px]"
                style={{
                    bottom: "0",
                    right: "0",
                    opacity: 0.7
                }}
            />
        </div>
    );
}
