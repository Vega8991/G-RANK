export default {
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: "#DC143C",
                    "primary-hover": "#B0102D",
                    "primary-pressed": "#8F0C23",
                    "on-primary": "#FFFFFF",
                },
                neutral: {
                    bg: "#0A0A0A",
                    "bg-alt": "#1C1C1C",
                    surface: "#111111",
                    "surface-alt": "#141414",
                    border: "rgba(255, 255, 255, 0.10)",
                    "text-primary": "#FFFFFF",
                    "text-secondary": "#D1D5DB",
                    "text-muted": "#6B7280",
                    "text-inverse": "#0A0A0A",
                },
                status: {
                    success: "#22C55E",
                    info: "#3B82F6",
                    danger: "#EF4444",
                    warning: "#F59E0B",
                },
                rank: {
                    bronze: "#CD7F32",
                    silver: "#C0C0C0",
                    gold: "#FFD700",
                    platinum: "#E5E4E2",
                    diamond: "#B9F2FF",
                    master: "#9B30FF",
                    elite: "#DC143C",
                },
            },
            spacing: {
                1: "4px",
                2: "8px",
                3: "12px",
                4: "16px",
                6: "24px",
                8: "32px",
                10: "40px",
                12: "48px",
                16: "64px",
            },
            borderRadius: {
                sm: "8px",
                md: "12px",
                lg: "16px",
                pill: "999px",
            },
            boxShadow: {
                soft: "0 8px 24px rgba(0, 0, 0, 0.45)",
                card: "0 10px 30px rgba(0, 0, 0, 0.55)",
            },
            fontFamily: {
                sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
            },
        },
    },
};
