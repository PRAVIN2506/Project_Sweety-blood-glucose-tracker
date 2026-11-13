import {
    useCallback,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    ToastContext,
    type ToastContextValue,
    type ToastItem,
    type ToastOptions,
    type ToastType,
} from "./toastContextBase";
import ToastContainer from "./ToastContainer";

const DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 6000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const removeToast = useCallback((id: string) => {
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }

        setToasts((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const addToast = useCallback(
        (options: ToastOptions): string => {
            const type = options.type || "info";
            const duration = options.duration ?? DEFAULT_DURATIONS[type];

            let toastId = "";

            setToasts((prev) => {
                // Deduplicate if identical title and type already exists
                const existing = prev.find(
                    (t) => t.title === options.title && t.type === type
                );

                if (existing) {
                    toastId = existing.id;
                    // Reset its timer
                    if (timersRef.current[existing.id]) {
                        clearTimeout(timersRef.current[existing.id]);
                    }
                    timersRef.current[existing.id] = setTimeout(() => {
                        removeToast(existing.id);
                    }, duration);

                    return prev;
                }

                const id =
                    options.id ||
                    `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                toastId = id;

                const newToast: ToastItem = {
                    id,
                    title: options.title,
                    description: options.description,
                    type,
                    duration,
                };

                timersRef.current[id] = setTimeout(() => {
                    removeToast(id);
                }, duration);

                // Keep maximum 5 notifications
                return [...prev.slice(-4), newToast];
            });

            return toastId;
        },
        [removeToast]
    );

    const success = useCallback(
        (title: string, description?: string) =>
            addToast({ title, description, type: "success" }),
        [addToast]
    );

    const error = useCallback(
        (title: string, description?: string) =>
            addToast({ title, description, type: "error" }),
        [addToast]
    );

    const warning = useCallback(
        (title: string, description?: string) =>
            addToast({ title, description, type: "warning" }),
        [addToast]
    );

    const info = useCallback(
        (title: string, description?: string) =>
            addToast({ title, description, type: "info" }),
        [addToast]
    );

    const contextValue = useMemo<ToastContextValue>(
        () => ({
            addToast,
            removeToast,
            success,
            error,
            warning,
            info,
        }),
        [addToast, removeToast, success, error, warning, info]
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export default ToastProvider;
