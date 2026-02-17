import { useMemo } from 'react';

/**
 * LiquidEther Component - CSS-based ambient background with floating blobs
 * Creates a fluid, ethereal atmosphere with multi-layered gradients
 * 
 * @param {Object} props
 * @param {string} [props.primaryColor="#DC143C"] - Primary glow color
 * @param {string} [props.secondaryColor="#9333EA"] - Secondary glow color
 * @param {string} [props.accentColor="#0EA5E9"] - Accent glow color
 * @param {number} [props.intensity=0.6] - Overall opacity intensity (0-1)
 * @param {number} [props.blur=100] - Blur amount in pixels
 * @param {number} [props.animationSpeed=8] - Animation duration in seconds
 * @param {string} [props.className=""] - Additional CSS classes
 */
const LiquidEther = ({
    primaryColor = '#DC143C',
    secondaryColor = '#9333EA',
    accentColor = '#0EA5E9',
    intensity = 0.6,
    blur = 100,
    animationSpeed = 8,
    className = ''
}) => {
    // Parse hex to rgba for gradient construction
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const baseLayer = useMemo(
        () => ({
            background: `
        radial-gradient(circle at 0% 0%, ${hexToRgba(primaryColor, 0.28)}, transparent 55%),
        radial-gradient(circle at 100% 0%, ${hexToRgba(secondaryColor, 0.32)}, transparent 55%),
        radial-gradient(circle at 0% 100%, ${hexToRgba(accentColor, 0.30)}, transparent 55%),
        radial-gradient(circle at 100% 100%, ${hexToRgba(primaryColor, 0.25)}, transparent 55%)
      `,
            mixBlendMode: 'screen',
            opacity: intensity
        }),
        [primaryColor, secondaryColor, accentColor, intensity]
    );

    const animatedLayer = useMemo(
        () => ({
            background: `
        radial-gradient(ellipse at 20% 30%, ${hexToRgba(primaryColor, 0.20)}, transparent 50%),
        radial-gradient(ellipse at 80% 70%, ${hexToRgba(secondaryColor, 0.18)}, transparent 50%)
      `,
            mixBlendMode: 'screen',
            animationDuration: `${animationSpeed}s`,
            opacity: intensity * 0.67
        }),
        [primaryColor, secondaryColor, animationSpeed, intensity]
    );

    const blob1Style = useMemo(
        () => ({
            top: '8%',
            left: '3%',
            background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.50)}, transparent 65%)`,
            filter: `blur(${blur * 0.9}px)`,
            opacity: intensity * 1.42,
            mixBlendMode: 'screen'
        }),
        [primaryColor, blur, intensity]
    );

    const blob2Style = useMemo(
        () => ({
            bottom: '-8%',
            right: '-8%',
            background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.40)}, ${hexToRgba(secondaryColor, 0.35)}, transparent 65%)`,
            filter: `blur(${blur}px)`,
            opacity: intensity * 1.5,
            mixBlendMode: 'screen'
        }),
        [accentColor, secondaryColor, blur, intensity]
    );

    const blob3Style = useMemo(
        () => ({
            top: '50%',
            right: '10%',
            background: `radial-gradient(circle, ${hexToRgba(secondaryColor, 0.35)}, transparent 60%)`,
            filter: `blur(${blur * 0.8}px)`,
            opacity: intensity,
            mixBlendMode: 'screen'
        }),
        [secondaryColor, blur, intensity]
    );

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
            {/* Base multi-layer ambient glow */}
            <div className="absolute inset-0" style={baseLayer} />

            {/* Animated flow layer */}
            <div className="absolute inset-0 animate-pulse" style={animatedLayer} />

            {/* Floating ethereal blobs */}
            <div className="absolute w-80 h-80" style={blob1Style} />
            <div className="absolute w-96 h-96" style={blob2Style} />
            <div className="absolute w-64 h-64" style={blob3Style} />
        </div>
    );
};

// Preset configurations for common color schemes
export const LiquidEtherPresets = {
    crimson: {
        primaryColor: '#DC143C',
        secondaryColor: '#9333EA',
        accentColor: '#0EA5E9',
        intensity: 0.6,
        blur: 100,
        animationSpeed: 8
    },
    neon: {
        primaryColor: '#FF00FF',
        secondaryColor: '#00FFFF',
        accentColor: '#FFFF00',
        intensity: 0.7,
        blur: 90,
        animationSpeed: 6
    },
    ocean: {
        primaryColor: '#0EA5E9',
        secondaryColor: '#06B6D4',
        accentColor: '#3B82F6',
        intensity: 0.5,
        blur: 110,
        animationSpeed: 10
    },
    aurora: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        accentColor: '#10B981',
        intensity: 0.65,
        blur: 95,
        animationSpeed: 9
    }
};

export default LiquidEther;
