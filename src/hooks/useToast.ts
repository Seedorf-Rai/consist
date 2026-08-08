import { useCallback, useRef, useState } from "react";
import type { ToastState } from "../components/ui";

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<number | null>(null);

  const flash = useCallback((msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, flash };
}
