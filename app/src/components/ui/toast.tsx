"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration ?? (toast.type === "error" ? 6000 : 4000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, message?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-toast,9999)] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: {
      bg: "bg-green-500/10 border-green-500/30",
      icon: "text-green-400",
      title: "text-green-300",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: "text-red-400",
      title: "text-red-300",
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/30",
      icon: "text-yellow-400",
      title: "text-yellow-300",
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: "text-blue-400",
      title: "text-blue-300",
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300",
        style.bg
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.icon)} />
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", style.title)}>{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export { ToastContainer, ToastItem };
