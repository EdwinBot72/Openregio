import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useContentProtection() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const blockKeyboardShortcuts = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const key = e.key.toLowerCase();
      if (
        key === "u" ||
        key === "s" ||
        key === "p"
      ) {
        e.preventDefault();
      }
      if (key === "a") {
        const target = e.target as HTMLElement;
        const tag = target?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeyboardShortcuts);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeyboardShortcuts);
    };
  }, [user]);
}
