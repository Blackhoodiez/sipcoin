"use client";

import { useEffect, useState } from "react";
import { Command, X, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsProps {
  onSave?: () => void;
  onClose?: () => void;
  onBack?: () => void;
  className?: string;
}

export function KeyboardShortcuts({
  onSave,
  onClose,
  onBack,
  className,
}: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }

      // Escape to close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }

      // Cmd/Ctrl + K to show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // Backspace to go back (when not in input)
      if (e.key === "Backspace" && !isInputElement(e.target as Element)) {
        e.preventDefault();
        onBack?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Hide shortcuts when Cmd/Ctrl + K is released
      if (e.key === "k") {
        setShowShortcuts(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [onSave, onClose, onBack]);

  const isInputElement = (element: Element): boolean => {
    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      (element as HTMLElement).contentEditable === "true"
    );
  };

  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Command className="h-5 w-5 mr-2" />
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setShowShortcuts(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {onSave && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Save changes</span>
              <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
                {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + S
              </kbd>
            </div>
          )}

          {onClose && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Close</span>
              <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
                Esc
              </kbd>
            </div>
          )}

          {onBack && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Go back</span>
              <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
                ← Backspace
              </kbd>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Show shortcuts</span>
            <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + K
            </kbd>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            Press any key to close this dialog
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const modifier = e.metaKey || e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Create key combination string
      const combination = [
        modifier && (navigator.platform.includes("Mac") ? "cmd" : "ctrl"),
        shift && "shift",
        alt && "alt",
        key,
      ]
        .filter(Boolean)
        .join("+");

      const handler = shortcuts[combination];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
