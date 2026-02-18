let Label = function Label({ htmlFor = "", className = "", children }) {
    let baseClass = "block text-sm font-medium text-neutral-text-primary mb-2";

    return (
        <label htmlFor={htmlFor} className={baseClass + " " + className}>
            {children}
        </label>
    );
};

export default Label;
