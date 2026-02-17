import LightPillar from "./ui/LightPillar";
import LiquidEther, { LiquidEtherPresets } from "./ui/LiquidEther";

/**
 * ReactiveBackground - Combined Light Pillar (WebGL) and Liquid Ether effects
 * Professional implementation using react-bits style components with Three.js
 */
export default function ReactiveBackground({ mousePos }) {
    return (
        <>
            {/* Liquid Ether ambient background */}
            <LiquidEther
                {...LiquidEtherPresets.crimson}
                intensity={0.6}
                animationSpeed={8}
                blur={95}
            />

            {/* WebGL Light Pillar with volumetric rendering */}
            <LightPillar
                topColor="#ad1a37"
                bottomColor="#f7697e"
                intensity={1}
                rotationSpeed={0.6}
                glowAmount={0.003}
                pillarWidth={4.7}
                pillarHeight={0.8}
                noiseIntensity={1.4}
                pillarRotation={241}
                interactive={false}
                mixBlendMode="screen"
                quality="high"
            />
        </>
    );
}

