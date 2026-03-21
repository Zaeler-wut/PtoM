import { useState, useCallback } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (title: string, options?: { description?: string; variant?: ToastVariant }) => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        { id, title, description: options?.description, variant: options?.variant ?? "info" },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const success = (title: string, description?: string) =>
    addToast(title, { description, variant: "success" });

  const error = (title: string, description?: string) =>
    addToast(title, { description, variant: "error" });

  const warning = (title: string, description?: string) =>
    addToast(title, { description, variant: "warning" });

  const info = (title: string, description?: string) =>
    addToast(title, { description, variant: "info" });

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, success, error, warning, info, remove };
}
