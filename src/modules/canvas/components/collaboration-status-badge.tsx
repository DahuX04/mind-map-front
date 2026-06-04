import type { CollaborationStatus } from "../types/canvas.types";

const labels: Record<CollaborationStatus, string> = {
  connecting: "Conectando",
  connected: "Conectado",
  reconnecting: "Reconectando",
  synchronized: "Sincronizado",
  error: "Error de sync",
};

const styles: Record<CollaborationStatus, string> = {
  connecting: "bg-slate-100 text-slate-700",
  connected: "bg-emerald-50 text-emerald-700",
  reconnecting: "bg-amber-50 text-amber-700",
  synchronized: "bg-teal-50 text-teal-700",
  error: "bg-red-50 text-red-700",
};

export function CollaborationStatusBadge({ status }: { status: CollaborationStatus }) {
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${styles[status]}`} aria-live="polite">
      {labels[status]}
    </span>
  );
}
