import type { ReactNode } from "react";

interface LabelProps {
    htmlFor?: string;
    className?: string;
    children?: ReactNode;
}

let Label = function Label({ htmlFor = "", className = "", children }: LabelProps) {
    let baseClass = "block text-sm font-medium text-neutral-text-primary mb-2";

    return (
        <label htmlFor={htmlFor} className={baseClass + " " + className}>
            {children}
        </label>
    );
};

export default Label;
