import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    className?: string;
    children?: ReactNode;
}

let buttonVariants: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-[#dc143c] to-[#b0102d] hover:from-[#ff242f] hover:to-[#dc143c] text-white shadow-lg shadow-[#dc143c]/30 hover:shadow-xl hover:shadow-[#dc143c]/50 hover:scale-[1.02] active:scale-[0.98]",
    outline: "border border-[var(--neutral-border)]/40 hover:border-[var(--brand-primary)]/50 hover:bg-[var(--neutral-surface)]/50 backdrop-blur-md text-white hover:shadow-lg hover:shadow-[var(--brand-primary)]/20",
};

let Button = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonComponent({ variant = "primary", className = "", children, ...props }, ref) {
    let variantClass = buttonVariants[variant] || buttonVariants.primary;
    let baseClass = "rounded-md font-semibold transition-all duration-300 flex items-center gap-2 justify-center";

    return (
        <button ref={ref} className={baseClass + " " + variantClass + " " + className} {...props}>
            {children}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
