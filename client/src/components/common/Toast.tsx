import type { ToastItem, ToastType } from "./toastContextBase";

interface ToastProps {
    toast: ToastItem;
    onDismiss: (id: string) => void;
}

function StatusIndicator({ type }: { type: ToastType }) {
    switch (type) {
        case "success":
            return (
                <svg
                    className="h-4 w-4 shrink-0 text-accent"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M13.25 4.75L6 12L2.75 8.75" />
                </svg>
            );
        case "error":
            return (
                <svg
                    className="h-4 w-4 shrink-0 text-critical"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="8" cy="8" r="6" />
                    <line x1="8" y1="5" x2="8" y2="8.5" />
                    <line x1="8" y1="11" x2="8.01" y2="11" />
                </svg>
            );
        case "warning":
            return (
                <svg
                    className="h-4 w-4 shrink-0 text-amber-700"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M8 2.5L14 13.5H2L8 2.5Z" />
                    <line x1="8" y1="6.5" x2="8" y2="9.5" />
                    <line x1="8" y1="11.5" x2="8.01" y2="11.5" />
                </svg>
            );
        case "info":
        default:
            return (
                <svg
                    className="h-4 w-4 shrink-0 text-blue-700"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="8" cy="8" r="6" />
                    <line x1="8" y1="7.5" x2="8" y2="11.5" />
                    <circle cx="8" cy="5" r="0.75" fill="currentColor" stroke="none" />
                </svg>
            );
    }
}

function Toast({ toast, onDismiss }: ToastProps) {
    const isAlert = toast.type === "error";

    return (
        <div
            role={isAlert ? "alert" : "status"}
            aria-live={isAlert ? "assertive" : "polite"}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border-strong bg-surface p-3.5 transition-all duration-200 ease-out"
        >
            <div className="mt-0.5 flex shrink-0 items-center justify-center">
                <StatusIndicator type={toast.type} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                    {toast.title}
                </p>

                {toast.description && (
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {toast.description}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-1 text-text-muted hover:bg-surface-subtle hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
                <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                </svg>
            </button>
        </div>
    );
}

export default Toast;
