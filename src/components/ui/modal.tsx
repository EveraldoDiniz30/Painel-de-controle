"use client";

import { ReactNode, useState, cloneElement, isValidElement } from "react";
import { X } from "lucide-react";

export function Modal({
  trigger,
  title,
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: ReactNode;
  title: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const close = () => setOpen(false);

  return (
    <>
      {trigger &&
        (isValidElement(trigger)
          ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
              onClick: () => setOpen(true),
            })
          : trigger)}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 sm:pt-20">
          <div
            className="absolute inset-0"
            onClick={close}
            aria-hidden
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              <button
                onClick={close}
                className="rounded-lg p-1 text-muted hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-5 py-4">
              {typeof children === "function" ? children(close) : children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
