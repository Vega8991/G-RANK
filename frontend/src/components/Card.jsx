import { forwardRef } from "react";

let Card = forwardRef(function CardComponent({ className = "", children }, ref) {
    let baseClass = "bg-neutral-surface border border-neutral-border rounded-lg p-6";

    return (
        <div ref={ref} className={baseClass + " " + className}>
            {children}
        </div>
    );
});

Card.displayName = "Card";

let CardHeader = function CardHeader({ className = "", children }) {
    return <div className={"mb-4 " + className}>{children}</div>;
};

let CardTitle = function CardTitle({ className = "", children }) {
    return <h2 className={"text-2xl font-bold " + className}>{children}</h2>;
};

let CardDescription = function CardDescription({ className = "", children }) {
    return <p className={"text-neutral-text-secondary text-sm " + className}>{children}</p>;
};

let CardContent = function CardContent({ className = "", children }) {
    return <div className={className}>{children}</div>;
};

let CardFooter = function CardFooter({ className = "", children }) {
    return <div className={"mt-6 flex gap-2 " + className}>{children}</div>;
};

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
