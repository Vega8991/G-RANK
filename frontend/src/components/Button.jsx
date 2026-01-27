import { forwardRef } from "react";

let buttonVariants = {
    primary: "bg-[#dc143c] hover:bg-[#b0102d] text-white",
    outline: "border border-[#2a2a2a] hover:bg-[#111111] text-white",
};

let Button = forwardRef(function ButtonComponent({ variant = "primary", className = "", children, ...props }, ref) {
    let variantClass = buttonVariants[variant] || buttonVariants.primary;
    let baseClass = "rounded-md font-semibold transition-colors flex items-center gap-2 justify-center";

    return (
        <button ref={ref} className={baseClass + " " + variantClass + " " + className} {...props}>
            {children}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
