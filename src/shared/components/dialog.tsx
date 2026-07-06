"use client";

import { type ReactNode, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/src/shared/lib/cn";

export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={cn("panel w-full shadow-xl", maxWidth)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={description ? "app-dialog-description" : undefined}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 id="app-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id="app-dialog-description" className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button className="btn btn-ghost size-10 shrink-0 p-0" type="button" onClick={onClose} aria-label="Cerrar dialogo">
            <X className="size-4" aria-hidden />
          </button>
        </header>
        {children ? <div className="p-5">{children}</div> : null}
        {footer ? <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 p-4 sm:flex-row sm:justify-end">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  pending = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            className={cn("btn", destructive ? "border border-red-700 bg-red-700 text-white hover:bg-red-800" : "btn-primary")}
            type="button"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Procesando..." : confirmLabel}
          </button>
        </>
      }
    >
      {destructive ? (
        <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          Esta accion puede afectar a otros participantes conectados.
        </div>
      ) : null}
    </Dialog>
  );
}
