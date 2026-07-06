"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Bot, History, Lock, Share2, Unlock, UserCog, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AiAssistantPanel, type AiSuggestion } from "@/src/modules/ai-assistant";
import { CanvasToolbar, MindMapCanvas, type MindMapCanvasHandle } from "@/src/modules/canvas";
import { LiveblocksRoom, RoomAwareness } from "@/src/modules/collaboration";
import { SessionManagementPanel } from "@/src/modules/sessions";
import { createSnapshot, SnapshotHistoryPanel } from "@/src/modules/snapshots";
import { ErrorState } from "@/src/shared/components/error-state";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { useAuth } from "@/src/shared/auth/use-auth";
import { useMap, useUpdateMap } from "../hooks/use-maps";
import { MapAccessPanel } from "./map-access-panel";
import { MapTutorial } from "./map-tutorial";
import type { GuestAccess } from "@/src/modules/sessions";

export function MapEditorPage({
  mapId,
  sessionId,
  guestAccess,
}: {
  mapId: string;
  sessionId?: string;
  guestAccess?: GuestAccess;
}) {
  const auth = useAuth();
  const map = useMap(guestAccess ? undefined : mapId);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string | undefined>();
  const [rootTopic, setRootTopic] = useState<string | undefined>();
  const canvasRef = useRef<MindMapCanvasHandle | null>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const updateMap = useUpdateMap(mapId);

  const mapData = guestAccess
    ? {
        ...guestAccess.map,
        liveblocksRoomId: guestAccess.collaboration.roomId,
        permission: guestAccess.permission,
        editingLocked: guestAccess.permission === "viewer",
      }
    : map.data;
  const isGuest = Boolean(guestAccess);
  const isOwner = !isGuest && (mapData?.permission ?? "owner") === "owner";
  const canEdit = isGuest
    ? guestAccess?.permission === "editor"
    : isOwner || ((mapData?.permission ?? "owner") !== "viewer" && !mapData?.editingLocked);
  const canSnapshot = isOwner;

  const snapshotMutation = useMutation({
    mutationFn: () => {
      if (!canvasRef.current) throw new Error("Canvas no inicializado.");
      return createSnapshot(mapId, canvasRef.current.getStorage());
    },
  });

  const registerCanvas = useCallback((handle: MindMapCanvasHandle) => {
    canvasRef.current = handle;
  }, []);

  const selectedNodeId = selectedNodeIds[0];
  const userId = guestAccess?.guest.id ?? auth.user?.id ?? "local-user";
  const handleSelectionChange = useCallback((nodeIds: string[], primaryNodeLabel?: string) => {
    setSelectedNodeIds(nodeIds);
    setSelectedNodeLabel(primaryNodeLabel);
  }, []);

  const getCanvasState = useCallback(() => canvasRef.current?.getStorage(), []);

  if (!isGuest && map.error) {
    return <ErrorState error={map.error} />;
  }

  const title = mapData?.title ?? "Mapa mental";
  const roomId = mapData?.liveblocksRoomId;

  if (!roomId) {
    return <div className="grid min-h-dvh place-items-center text-sm text-slate-500">Cargando room colaborativa...</div>;
  }

  return (
    <LiveblocksRoom
      mapId={mapId}
      roomId={roomId}
      guestAccess={
        guestAccess
          ? {
              accessToken: guestAccess.accessToken,
              initialToken: guestAccess.collaboration.token,
            }
          : undefined
      }
    >
      <div className="fixed inset-0 z-30 flex flex-col bg-[var(--app-bg)]">
        <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-2 py-2 sm:flex-nowrap sm:gap-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link className="btn btn-ghost size-10 shrink-0 p-0" href={isGuest ? "/" : "/dashboard"} aria-label={isGuest ? "Salir del mapa" : "Volver al dashboard"}>
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {mapData?.description ?? "Canvas colaborativo"}
                {guestAccess ? ` · Invitado: ${guestAccess.guest.displayName}` : ""}
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 items-center justify-end gap-1 overflow-x-auto sm:w-auto sm:gap-2 sm:overflow-visible">
            {isOwner ? (
              <button
                className="btn btn-secondary size-10 p-0"
                type="button"
                onClick={() => updateMap.mutate({ editingLocked: !mapData?.editingLocked })}
                disabled={updateMap.isPending}
                aria-label={mapData?.editingLocked ? "Desbloquear edicion" : "Bloquear edicion de estudiantes"}
                title={mapData?.editingLocked ? "Desbloquear edicion" : "Bloquear edicion"}
              >
                {mapData?.editingLocked ? <Unlock className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
              </button>
            ) : null}
            {isOwner ? (
              <button className="btn btn-secondary size-10 shrink-0 p-0" type="button" onClick={() => setAccessOpen(true)} aria-label="Gestionar permisos" title="Gestionar permisos">
                <UserCog className="size-4" aria-hidden />
              </button>
            ) : null}
            {!isGuest ? (
              <>
                <button className="btn btn-secondary size-10 p-0 lg:hidden" type="button" onClick={() => setAiOpen(true)} aria-label="Abrir asistente de IA" title="Asistente de IA">
                  <Bot className="size-4" aria-hidden />
                </button>
                <button className="btn btn-secondary size-10 shrink-0 p-0" type="button" onClick={() => setSnapshotsOpen(true)} aria-label="Historial de versiones" title="Historial">
                  <History className="size-4" aria-hidden />
                </button>
                <button className="btn btn-primary size-10 p-0 xl:w-auto xl:px-3" type="button" onClick={() => setSessionsOpen(true)} disabled={!isOwner} aria-label="Compartir mapa">
                  <Share2 className="size-4" aria-hidden />
                  <span className="hidden xl:inline">Compartir</span>
                </button>
              </>
            ) : (
              <span className="rounded-md bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900">
                {canEdit ? "Invitado editor" : "Invitado lector"}
              </span>
            )}
          </div>
        </header>

        {snapshotMutation.error ? <div className="shrink-0 px-4 py-2 text-sm text-red-700">Snapshot: {getErrorMessage(snapshotMutation.error)}</div> : null}
        {snapshotMutation.isSuccess ? <div className="shrink-0 px-4 py-2 text-sm text-teal-700">Snapshot creado correctamente.</div> : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <CanvasToolbar
            canEdit={canEdit}
            canSnapshot={canSnapshot}
            onAddNode={() => canvasRef.current?.addNode()}
            onEditNode={() => canvasRef.current?.editSelected()}
            onDeleteNode={() => canvasRef.current?.deleteSelected()}
            onUndo={() => canvasRef.current?.undo()}
            onAutoLayout={() => canvasRef.current?.autoLayout()}
            onSnapshot={() => snapshotMutation.mutate()}
          />
          <section className="min-h-0 flex-1">
            <MindMapCanvas
              title={title}
              userId={userId}
              canEdit={canEdit}
              selectedNodeId={selectedNodeId}
              onSelectionChange={handleSelectionChange}
              onRootTopicChange={setRootTopic}
              registerCanvas={registerCanvas}
            />
          </section>
          {!isGuest ? (
            <div
              className={`${aiOpen ? "fixed inset-0 z-[80] flex justify-end bg-slate-950/40" : "hidden"} min-h-0 lg:static lg:z-auto lg:flex lg:w-80 lg:shrink-0 lg:bg-transparent`}
              role={aiOpen ? "dialog" : undefined}
              aria-modal={aiOpen ? true : undefined}
              aria-label={aiOpen ? "Asistente de IA" : undefined}
            >
              <button className="absolute inset-0 lg:hidden" type="button" onClick={() => setAiOpen(false)} aria-label="Cerrar asistente de IA" />
              <div className="relative z-10 flex h-full min-h-0 w-[min(100%,28rem)] flex-col bg-white shadow-xl lg:w-full lg:shadow-none">
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 lg:hidden">
                  <div className="flex items-center gap-2 font-semibold">
                    <Bot className="size-4 text-teal-700" aria-hidden />
                    Asistente de IA
                  </div>
                  <button className="btn btn-ghost size-10 p-0" type="button" onClick={() => setAiOpen(false)} aria-label="Cerrar asistente de IA">
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <AiAssistantPanel
                  mapId={mapId}
                  selectedNodeId={selectedNodeId}
                  selectedNodeLabel={selectedNodeLabel}
                  rootTopic={rootTopic ?? title}
                  canEdit={canEdit}
                  onAcceptSuggestion={(suggestion: AiSuggestion) => canvasRef.current?.addSuggestion(suggestion)}
                  getCanvasState={getCanvasState}
                />
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 text-xs text-slate-500 sm:px-4">
          <RoomAwareness sessionId={isGuest ? undefined : sessionId} />
          <span className="hidden truncate md:inline">
            {mapData?.editingLocked && !isOwner ? "Edicion bloqueada por el docente" : canEdit ? "Edicion habilitada" : "Solo lectura"}
          </span>
          <span className="truncate text-right">{selectedNodeLabel ? `Seleccionado: ${selectedNodeLabel}` : "Sin seleccion"}</span>
        </footer>

        {!isGuest ? <MapTutorial /> : null}
        {!isGuest && sessionsOpen ? <SessionManagementPanel mapId={mapId} getCanvasState={getCanvasState} onClose={() => setSessionsOpen(false)} /> : null}
        {!isGuest && snapshotsOpen ? <SnapshotHistoryPanel mapId={mapId} canRestore={isOwner} onClose={() => setSnapshotsOpen(false)} /> : null}
        {!isGuest && accessOpen ? <MapAccessPanel mapId={mapId} onClose={() => setAccessOpen(false)} /> : null}
      </div>
    </LiveblocksRoom>
  );
}
