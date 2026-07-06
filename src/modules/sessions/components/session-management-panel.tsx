"use client";

import { FormEvent, useMemo, useState } from "react";
import { BarChart3, Copy, Link2, Play, Plus, Square, X } from "lucide-react";
import type { CanvasStorage } from "@/src/modules/canvas";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { ConfirmDialog } from "@/src/shared/components/dialog";
import { formatDate } from "@/src/shared/lib/date";
import {
  useCreateInvite,
  useCreateSession,
  useEndSession,
  useSessionMetrics,
  useSessions,
  useStartSession,
} from "../hooks/use-sessions";

export function SessionManagementPanel({
  mapId,
  getCanvasState,
  onClose,
}: {
  mapId: string;
  getCanvasState: () => CanvasStorage | undefined;
  onClose: () => void;
}) {
  const sessions = useSessions(mapId);
  const create = useCreateSession(mapId);
  const start = useStartSession(mapId);
  const end = useEndSession(mapId);
  const invite = useCreateInvite(mapId);
  const [title, setTitle] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(15);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [invitePermission, setInvitePermission] = useState<"editor" | "viewer">("editor");
  const [inviteHours, setInviteHours] = useState(24);
  const [joinCodes, setJoinCodes] = useState<Record<string, string>>({});
  const [sessionToEnd, setSessionToEnd] = useState<string>();
  const metrics = useSessionMetrics(selectedSessionId);

  const shareUrl = useMemo(() => {
    if (invite.data?.shareUrl) return invite.data.shareUrl;
    if (!invite.data?.token || typeof window === "undefined") return "";
    return `${window.location.origin}/join/${invite.data.token}`;
  }, [invite.data?.shareUrl, invite.data?.token]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      { title: title.trim() || undefined, maxParticipants },
      {
        onSuccess: (result) => {
          setTitle("");
          setSelectedSessionId(result.id);
          if (result.joinCode) {
            setJoinCodes((current) => ({ ...current, [result.id]: result.joinCode as string }));
          }
        },
      },
    );
  };

  const finish = (sessionId: string) => {
    setSessionToEnd(sessionId);
  };

  const confirmFinish = () => {
    const canvasState = getCanvasState();
    if (!canvasState || !sessionToEnd) return;
    end.mutate(
      { sessionId: sessionToEnd, canvasState: canvasState as unknown as Record<string, unknown> },
      {
        onSuccess: () => {
          setSelectedSessionId(sessionToEnd);
          setSessionToEnd(undefined);
        },
      },
    );
  };

  const createShareLink = (sessionId?: string) => {
    invite.mutate({
      sessionId,
      permission: invitePermission,
      maxUses: maxParticipants,
      expiresAt: new Date(Date.now() + inviteHours * 60 * 60 * 1000).toISOString(),
    });
  };

  const error = sessions.error ?? create.error ?? start.error ?? end.error ?? invite.error;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="dialog" aria-modal="true" aria-label="Gestion de sesiones">
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold">Sesiones de clase</h2>
            <p className="mt-1 text-xs text-slate-500">Crea, comparte, inicia y mide la actividad</p>
          </div>
          <button className="btn btn-ghost size-10 p-0" type="button" onClick={onClose} aria-label="Cerrar">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-auto p-4">
          <form className="rounded-md border border-slate-200 p-4" onSubmit={submit}>
            <h3 className="text-sm font-semibold">Nueva sesion</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
              <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Clase de fotosintesis" />
              <input
                className="field"
                type="number"
                min={1}
                max={500}
                value={maxParticipants}
                onChange={(event) => setMaxParticipants(Number(event.target.value))}
                aria-label="Maximo de participantes"
              />
              <button className="btn btn-primary" type="submit" disabled={create.isPending}>
                <Plus className="size-4" aria-hidden />
                Crear
              </button>
            </div>
          </form>

          <section className="rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold">Opciones del enlace</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select className="field" value={invitePermission} onChange={(event) => setInvitePermission(event.target.value as "editor" | "viewer")}>
                <option value="editor">Puede editar</option>
                <option value="viewer">Solo lectura</option>
              </select>
              <select className="field" value={inviteHours} onChange={(event) => setInviteHours(Number(event.target.value))}>
                <option value={1}>Expira en 1 hora</option>
                <option value={8}>Expira en 8 horas</option>
                <option value={24}>Expira en 24 horas</option>
                <option value={168}>Expira en 7 dias</option>
              </select>
            </div>
            {shareUrl ? (
              <div className="mt-3 flex gap-2 rounded-md bg-teal-50 p-3">
                <input className="min-w-0 flex-1 bg-transparent text-sm text-teal-950 outline-none" readOnly value={shareUrl} aria-label="Enlace de invitacion" />
                <button className="btn btn-secondary h-9" type="button" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                  <Copy className="size-4" aria-hidden />
                  Copiar
                </button>
              </div>
            ) : null}
          </section>

          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(error)}</p> : null}

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Historial</h3>
              <span className="text-xs text-slate-500">{sessions.data?.length ?? 0} sesiones</span>
            </div>
            <div className="mt-3 space-y-3">
              {(sessions.data ?? []).map((session) => (
                <article key={session.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-medium">{session.title ?? "Sesion colaborativa"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {session.status} · {session._count?.participants ?? 0}/{session.maxParticipants} participantes
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(session.startsAt ?? session.createdAt)}</p>
                      {joinCodes[session.id] || session.joinCode ? (
                        <p className="mt-2 font-mono text-lg font-semibold tracking-widest">{joinCodes[session.id] ?? session.joinCode}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.status === "scheduled" ? (
                        <button className="btn btn-primary h-9" type="button" onClick={() => start.mutate(session.id)} disabled={start.isPending}>
                          <Play className="size-4" aria-hidden />
                          Iniciar
                        </button>
                      ) : null}
                      {session.status === "active" ? (
                        <button className="btn btn-secondary h-9 text-red-700" type="button" onClick={() => finish(session.id)} disabled={end.isPending}>
                          <Square className="size-4" aria-hidden />
                          Finalizar
                        </button>
                      ) : null}
                      <button className="btn btn-secondary h-9" type="button" onClick={() => createShareLink(session.id)} disabled={invite.isPending}>
                        <Link2 className="size-4" aria-hidden />
                        Compartir
                      </button>
                      <button className="btn btn-secondary h-9" type="button" onClick={() => setSelectedSessionId(session.id)}>
                        <BarChart3 className="size-4" aria-hidden />
                        Metricas
                      </button>
                    </div>
                  </div>
                  {selectedSessionId === session.id && metrics.data ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                      <Metric value={metrics.data.participants} label="Participantes" />
                      <Metric value={metrics.data.activeParticipants} label="Activos" />
                      <Metric value={metrics.data.nodesCreated} label="Nodos" />
                    </div>
                  ) : null}
                </article>
              ))}
              {!sessions.isLoading && !sessions.data?.length ? <p className="text-sm text-slate-500">Aun no hay sesiones para este mapa.</p> : null}
            </div>
          </section>
        </div>
      </aside>
      <ConfirmDialog
        open={Boolean(sessionToEnd)}
        title="Finalizar sesion"
        description="Se cerrara el acceso activo y se guardara un snapshot del estado actual del canvas."
        confirmLabel="Finalizar y guardar"
        destructive
        pending={end.isPending}
        onConfirm={confirmFinish}
        onClose={() => setSessionToEnd(undefined)}
      />
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
