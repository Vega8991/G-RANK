export interface LiquidEtherPreset {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    intensity: number;
    blur: number;
    animationSpeed: number;
}

export const LiquidEtherPresets: Record<string, LiquidEtherPreset> = {
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
