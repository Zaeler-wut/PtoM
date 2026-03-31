import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useContext, useState, useCallback } from "react";
import { RiCheckboxCircleFill, RiErrorWarningFill, RiCloseLine } from "react-icons/ri";

// ── Types ──────────────────────────────────────────────────────────────────
interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error") => void;
}

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

// ── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={3000}>
        {children}

        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            defaultOpen
            onOpenChange={(open) => !open && remove(t.id)}
            className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg w-72
              data-[state=open]:animate-in data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
              data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full"
          >
            {t.type === "success" ? (
              <RiCheckboxCircleFill size={18} className="text-green-400 flex-shrink-0" />
            ) : (
              <RiErrorWarningFill size={18} className="text-red-400 flex-shrink-0" />
            )}
            <RadixToast.Description className="flex-1">{t.message}</RadixToast.Description>
            <RadixToast.Close asChild>
              <button className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                <RiCloseLine size={16} />
              </button>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
