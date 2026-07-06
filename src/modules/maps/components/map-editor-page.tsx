"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, History, Lock, Share2, Unlock, UserCog } from "lucide-react";
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

export function MapEditorPage({ mapId, sessionId }: { mapId: string; sessionId?: string }) {
  const auth = useAuth();
  const map = useMap(mapId);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string | undefined>();
  const [rootTopic, setRootTopic] = useState<string | undefined>();
  const canvasRef = useRef<MindMapCanvasHandle | null>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const updateMap = useUpdateMap(mapId);

  const isOwner = (map.data?.permission ?? "owner") === "owner";
  const canEdit = isOwner || ((map.data?.permission ?? "owner") !== "viewer" && !map.data?.editingLocked);
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
  const userId = auth.user?.id ?? "local-user";
  const handleSelectionChange = useCallback((nodeIds: string[], primaryNodeLabel?: string) => {
    setSelectedNodeIds(nodeIds);
    setSelectedNodeLabel(primaryNodeLabel);
  }, []);

  const getCanvasState = useCallback(() => canvasRef.current?.getStorage(), []);

  if (map.error) {
    return <ErrorState error={map.error} />;
  }

  const title = map.data?.title ?? "Mapa mental";
  const roomId = map.data?.liveblocksRoomId;

  if (!roomId) {
    return <div className="grid min-h-dvh place-items-center text-sm text-slate-500">Cargando room colaborativa...</div>;
  }

  return (
    <LiveblocksRoom mapId={mapId} roomId={roomId}>
      <div className="fixed inset-0 z-30 flex flex-col bg-[var(--app-bg)]">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="btn btn-ghost size-10 p-0" href="/dashboard" aria-label="Volver al dashboard">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">{title}</h1>
            <p className="text-xs text-slate-500">{map.data?.description ?? "Canvas colaborativo"}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isOwner ? (
            <button
              className="btn btn-secondary size-10 p-0"
              type="button"
              onClick={() => updateMap.mutate({ editingLocked: !map.data?.editingLocked })}
              disabled={updateMap.isPending}
              aria-label={map.data?.editingLocked ? "Desbloquear edicion" : "Bloquear edicion de estudiantes"}
              title={map.data?.editingLocked ? "Desbloquear edicion" : "Bloquear edicion"}
            >
              {map.data?.editingLocked ? <Unlock className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            </button>
          ) : null}
          {isOwner ? (
            <button className="btn btn-secondary size-10 p-0" type="button" onClick={() => setAccessOpen(true)} aria-label="Gestionar permisos" title="Gestionar permisos">
              <UserCog className="size-4" aria-hidden />
            </button>
          ) : null}
          <button className="btn btn-secondary size-10 p-0" type="button" onClick={() => setSnapshotsOpen(true)} aria-label="Historial de versiones" title="Historial">
            <History className="size-4" aria-hidden />
          </button>
          <button className="btn btn-primary" type="button" onClick={() => setSessionsOpen(true)} disabled={!isOwner}>
            <Share2 className="size-4" aria-hidden />
            <span className="hidden xl:inline">Compartir</span>
          </button>
        </div>
        </header>

        {snapshotMutation.error ? <div className="shrink-0 px-4 py-2 text-sm text-red-700">Snapshot: {getErrorMessage(snapshotMutation.error)}</div> : null}
        {snapshotMutation.isSuccess ? <div className="shrink-0 px-4 py-2 text-sm text-teal-700">Snapshot creado correctamente.</div> : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <CanvasToolbar
            canEdit={canEdit}
            canSnapshot={canSnapshot}
            onAddNode={() => canvasRef.current?.addNode()}
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

        <footer className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 text-xs text-slate-500 sm:px-4">
          <RoomAwareness sessionId={sessionId} />
          <span className="hidden truncate md:inline">
            {map.data?.editingLocked && !isOwner ? "Edicion bloqueada por el docente" : canEdit ? "Edicion habilitada" : "Solo lectura"}
          </span>
          <span className="truncate text-right">{selectedNodeLabel ? `Seleccionado: ${selectedNodeLabel}` : "Sin seleccion"}</span>
        </footer>

        <MapTutorial />
        {sessionsOpen ? <SessionManagementPanel mapId={mapId} getCanvasState={getCanvasState} onClose={() => setSessionsOpen(false)} /> : null}
        {snapshotsOpen ? <SnapshotHistoryPanel mapId={mapId} canRestore={isOwner} onClose={() => setSnapshotsOpen(false)} /> : null}
        {accessOpen ? <MapAccessPanel mapId={mapId} onClose={() => setAccessOpen(false)} /> : null}
      </div>
    </LiveblocksRoom>
  );
}
