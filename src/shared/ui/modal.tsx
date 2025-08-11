"use client";

import { cn } from "@/shared/utils/utils";
import { X } from "lucide-react";
import * as React from "react";


interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  children,
  className,
  open = false,
  onClose,
  title,
  footer,
  size = "md",
  ...props
}: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "relative z-50 w-full rounded-lg bg-white shadow-lg",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div className="border-t p-4 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
