import { forwardRef, type ReactNode } from "react";

interface CardProps {
    className?: string;
    children?: ReactNode;
}

let Card = forwardRef<HTMLDivElement, CardProps>(function CardComponent({ className = "", children }, ref) {
    let baseClass = "bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300";

    return (
        <div ref={ref} className={baseClass + " " + className}>
            {children}
        </div>
    );
});

Card.displayName = "Card";

let CardHeader = function CardHeader({ className = "", children }: { className?: string; children?: ReactNode }) {
    return <div className={"mb-4 " + className}>{children}</div>;
};

let CardTitle = function CardTitle({ className = "", children }: { className?: string; children?: ReactNode }) {
    return <h2 className={"text-2xl font-bold text-[var(--neutral-text)] " + className}>{children}</h2>;
};

let CardDescription = function CardDescription({ className = "", children }: { className?: string; children?: ReactNode }) {
    return <p className={"text-[var(--neutral-text-secondary)] text-sm leading-relaxed " + className}>{children}</p>;
};

let CardContent = function CardContent({ className = "", children }: { className?: string; children?: ReactNode }) {
    return <div className={className}>{children}</div>;
};

let CardFooter = function CardFooter({ className = "", children }: { className?: string; children?: ReactNode }) {
    return <div className={"mt-6 flex gap-2 " + className}>{children}</div>;
};

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
