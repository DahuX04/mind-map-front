"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Copy, Share2, Users } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { AiAssistantPanel, type AiSuggestion } from "@/src/modules/ai-assistant";
import { CanvasToolbar, CollaborationStatusBadge, MindMapCanvas, type CollaborationStatus, type MindMapCanvasHandle } from "@/src/modules/canvas";
import { LiveblocksRoom, useCollaborationToken } from "@/src/modules/collaboration";
import { createInvite } from "@/src/modules/sessions";
import { createSnapshot } from "@/src/modules/snapshots";
import { ErrorState } from "@/src/shared/components/error-state";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { useAuth } from "@/src/shared/auth/use-auth";
import { useMap } from "../hooks/use-maps";

export function MapEditorPage({ mapId }: { mapId: string }) {
  const auth = useAuth();
  const map = useMap(mapId);
  const token = useCollaborationToken(mapId);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string | undefined>();
  const [rootTopic, setRootTopic] = useState<string | undefined>();
  const canvasRef = useRef<MindMapCanvasHandle | null>(null);
  const [inviteToken, setInviteToken] = useState<string>("");

  const canEdit = (map.data?.permission ?? "owner") !== "viewer";
  const canSnapshot = (map.data?.permission ?? "owner") === "owner";
  const status: CollaborationStatus = token.isError ? "error" : token.isLoading ? "connecting" : "synchronized";

  const snapshotMutation = useMutation({
    mutationFn: () => {
      if (!canvasRef.current) throw new Error("Canvas no inicializado.");
      return createSnapshot(mapId, canvasRef.current.getStorage());
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => createInvite(mapId, { permission: "editor", maxUses: 30 }),
    onSuccess: (result) => setInviteToken(result.token),
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

  const shareUrl = useMemo(() => {
    if (!inviteToken) return "";
    return `${window.location.origin}/join/${inviteToken}`;
  }, [inviteToken]);

  if (map.error) {
    return <ErrorState error={map.error} />;
  }

  const title = map.data?.title ?? "Mapa mental";

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[var(--app-bg)]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="btn btn-ghost size-10 p-0" href="/dashboard" aria-label="Volver al dashboard">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">{title}</h1>
            <p className="text-xs text-slate-500">{map.data?.description ?? "Canvas colaborativo"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CollaborationStatusBadge status={status} />
          <div className="hidden items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 sm:flex">
            <Users className="size-4" aria-hidden />
            1 conectado
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => inviteMutation.mutate()} disabled={!canSnapshot || inviteMutation.isPending}>
            <Share2 className="size-4" aria-hidden />
            Compartir
          </button>
        </div>
      </header>

      {inviteToken ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-950">
          <span className="truncate">Enlace: {shareUrl}</span>
          <button className="btn btn-secondary h-9" type="button" onClick={() => navigator.clipboard.writeText(shareUrl)}>
            <Copy className="size-4" aria-hidden />
            Copiar
          </button>
        </div>
      ) : null}

      {token.error ? <div className="shrink-0 px-4 py-2 text-sm text-red-700">Liveblocks: {getErrorMessage(token.error)}</div> : null}
      {snapshotMutation.error ? <div className="shrink-0 px-4 py-2 text-sm text-red-700">Snapshot: {getErrorMessage(snapshotMutation.error)}</div> : null}
      {snapshotMutation.isSuccess ? <div className="shrink-0 px-4 py-2 text-sm text-teal-700">Snapshot creado correctamente.</div> : null}

      {map.data?.liveblocksRoomId ? (
        <LiveblocksRoom mapId={mapId} roomId={map.data.liveblocksRoomId}>
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
            />
          </div>
        </LiveblocksRoom>
      ) : (
        <div className="grid flex-1 place-items-center text-sm text-slate-500">Cargando room colaborativa...</div>
      )}

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 text-xs text-slate-500">
        <span>{canEdit ? "Edicion habilitada" : "Solo lectura"}</span>
        <span>{selectedNodeId ? `Seleccion: ${selectedNodeId}` : "Sin seleccion"}</span>
      </footer>
    </div>
  );
}
