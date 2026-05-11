import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    // What to show when the child throws. Defaults to nothing (null).
    fallback?: ReactNode;
    // Called when an error is caught. Useful for removing side effects (e.g. cursor class).
    onError?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch() {
        this.props.onError?.();
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }
        return this.props.children;
    }
}
