import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isDestructive = true,
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Auto focus cancel button on open for safety
        cancelButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isLoading) {
                event.preventDefault();
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-desc"
                className="w-full max-w-md rounded-lg border border-border-strong bg-surface p-6"
            >
                <h2
                    id="confirm-dialog-title"
                    className="text-base font-semibold text-text-primary"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-desc"
                    className="mt-2 text-sm leading-relaxed text-text-secondary"
                >
                    {description}
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`rounded px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isDestructive
                                ? "bg-critical hover:bg-critical/90"
                                : "bg-accent hover:bg-accent-hover"
                        }`}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
