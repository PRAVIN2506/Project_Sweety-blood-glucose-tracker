import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
    id?: string;
}

export interface ToastItem {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
    duration: number;
}

export interface ToastContextValue {
    addToast: (options: ToastOptions) => string;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    warning: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
