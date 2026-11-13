import type { ToastItem } from "./toastContextBase";
import Toast from "./Toast";

interface ToastContainerProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <aside
            aria-label="Notifications"
            className="pointer-events-none fixed top-16 right-4 left-4 z-50 flex flex-col items-center gap-2 sm:top-4 sm:right-4 sm:left-auto sm:w-96 sm:items-end"
        >
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </aside>
    );
}

export default ToastContainer;
