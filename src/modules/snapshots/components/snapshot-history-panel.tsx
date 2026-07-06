"use client";

import { useState } from "react";
import { History, RotateCcw, X } from "lucide-react";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { ConfirmDialog } from "@/src/shared/components/dialog";
import { formatDate } from "@/src/shared/lib/date";
import { useRestoreSnapshot, useSnapshots } from "../hooks/use-snapshots";

const reasonLabels: Record<string, string> = {
  initial: "Estado inicial",
  manual: "Guardado manual",
  session_end: "Fin de sesion",
  auto_checkpoint: "Checkpoint automatico",
  migration: "Migracion",
  restore: "Restauracion",
};

export function SnapshotHistoryPanel({
  mapId,
  canRestore,
  onClose,
}: {
  mapId: string;
  canRestore: boolean;
  onClose: () => void;
}) {
  const snapshots = useSnapshots(mapId);
  const restore = useRestoreSnapshot(mapId);
  const [snapshotToRestore, setSnapshotToRestore] = useState<string>();

  const requestRestore = (snapshotId: string) => {
    setSnapshotToRestore(snapshotId);
  };

  const confirmRestore = () => {
    if (!snapshotToRestore) return;
    restore.mutate(snapshotToRestore, {
      onSuccess: () => window.location.reload(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="dialog" aria-modal="true" aria-label="Historial de versiones">
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <History className="size-5 text-teal-700" aria-hidden />
              Historial de versiones
            </h2>
            <p className="mt-1 text-xs text-slate-500">Snapshots persistidos del canvas</p>
          </div>
          <button className="btn btn-ghost size-10 p-0" type="button" onClick={onClose} aria-label="Cerrar">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4">
          {snapshots.isLoading ? <p className="text-sm text-slate-500">Cargando versiones...</p> : null}
          {snapshots.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(snapshots.error)}</p> : null}
          {restore.error ? <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(restore.error)}</p> : null}
          <div className="space-y-3">
            {(snapshots.data ?? []).map((snapshot) => (
              <article key={snapshot.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{reasonLabels[snapshot.reason] ?? snapshot.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(snapshot.createdAt)} · Esquema v{snapshot.schemaVersion}</p>
                  </div>
                  {canRestore ? (
                    <button
                      className="btn btn-secondary h-9"
                      type="button"
                      onClick={() => requestRestore(snapshot.id)}
                      disabled={restore.isPending}
                      title="Restaurar esta version"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      Restaurar
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {!snapshots.isLoading && !snapshots.data?.length ? <p className="text-sm text-slate-500">No hay snapshots disponibles.</p> : null}
          </div>
        </div>
      </aside>
      <ConfirmDialog
        open={Boolean(snapshotToRestore)}
        title="Restaurar version"
        description="Se creara un checkpoint del estado actual antes de reemplazar el canvas por esta version."
        confirmLabel="Restaurar"
        destructive
        pending={restore.isPending}
        onConfirm={confirmRestore}
        onClose={() => setSnapshotToRestore(undefined)}
      />
    </div>
  );
}
