"use client";

import {
  Background,
  Connection,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { useOthers, useUndo } from "@liveblocks/react";
import { Cursors, type CursorsCursorProps, useLiveblocksFlow } from "@liveblocks/react-flow";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { env } from "@/src/shared/config/env";
import { formatPresenceName } from "@/src/shared/auth/user-display";
import { createLocalId } from "@/src/shared/lib/ids";
import { ConfirmDialog, Dialog } from "@/src/shared/components/dialog";
import { useUiStore } from "@/src/shared/store/ui-store";
import { autoLayout } from "../utils/layout";
import { createInitialCanvas } from "../utils/initial-canvas";
import type { CanvasStorage, MindMapEdge, MindMapNode, MindMapNodeType } from "../types/canvas.types";
import { MindMapNodeView } from "./mind-map-node";

const nodeTypes = { mindMapNode: MindMapNodeView };

function CollaborativeCursor({ connectionId }: CursorsCursorProps) {
  const others = useOthers();
  const user = others.find((other) => other.connectionId === connectionId);
  const info = user?.info as { name?: string } | undefined;

  return (
    <div className="pointer-events-none flex items-start gap-1">
      <svg className="size-4 drop-shadow-sm" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 3.75 19.25 12 12 14.1 9.75 21.25 4 3.75Z" fill="#0f172a" stroke="white" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
      <span className="mt-2 rounded-md bg-slate-950 px-1.5 py-1 text-[10px] font-semibold leading-none text-white shadow-sm">
        {formatPresenceName(info?.name)}
      </span>
    </div>
  );
}

export type MindMapCanvasHandle = {
  addNode: () => void;
  deleteSelected: () => void;
  undo: () => void;
  autoLayout: () => void;
  addSuggestion: (input: { label: string; description?: string; parentNodeId: string }) => void;
  getStorage: () => CanvasStorage;
};

export function MindMapCanvas({
  title,
  userId,
  canEdit,
  onSelectionChange,
  onRootTopicChange,
  registerCanvas,
  selectedNodeId,
}: {
  title: string;
  userId: string;
  canEdit: boolean;
  onSelectionChange: (nodeIds: string[], primaryNodeLabel?: string) => void;
  onRootTopicChange?: (rootTopic: string) => void;
  registerCanvas: (handle: MindMapCanvasHandle) => void;
  selectedNodeId?: string;
}) {
  const initial = useMemo(() => createInitialCanvas(title, userId), [title, userId]);
  const undo = useUndo();
  const connectMode = useUiStore((state) => state.connectMode);
  const flow = useLiveblocksFlow<MindMapNode, MindMapEdge>({
    nodes: { initial: initial.nodes },
    edges: { initial: initial.edges },
  });
  const nodes = flow.nodes ?? initial.nodes;
  const edges = flow.edges ?? initial.edges;
  const [localSelectedNodeIds, setLocalSelectedNodeIds] = useState<string[]>([]);
  const [localSelectedEdgeIds, setLocalSelectedEdgeIds] = useState<string[]>([]);
  const selectedNodeIdsRef = useRef<string[]>([]);
  const selectedEdgeIdsRef = useRef<string[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<{ nodes: MindMapNode[]; edges: MindMapEdge[] } | null>(null);
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [notice, setNotice] = useState<string>();

  const renderedNodes = useMemo(
    () => nodes.map((node) => ({ ...node, selected: localSelectedNodeIds.includes(node.id) })),
    [localSelectedNodeIds, nodes],
  );
  const renderedEdges = useMemo(
    () => edges.map((edge) => ({ ...edge, selected: localSelectedEdgeIds.includes(edge.id) })),
    [edges, localSelectedEdgeIds],
  );

  const storage = useCallback(
    (): CanvasStorage => ({
      schemaVersion: 1,
      rootNodeId: "node-root",
      nodes,
      edges,
    }),
    [edges, nodes],
  );

  const addNode = useCallback(
    (nodeType: MindMapNodeType = "concept", parentId = selectedNodeId ?? "node-root", input?: { label?: string; description?: string; source?: "human" | "ai" }) => {
      if (!canEdit || flow.isLoading) return;
      const parent = nodes.find((node) => node.id === parentId) ?? nodes[0];
      const id = createLocalId("node");
      const now = new Date().toISOString();
      const nextNode: MindMapNode = {
        id,
        type: "mindMapNode",
        position: {
          x: (parent?.position.x ?? 0) + 260,
          y: (parent?.position.y ?? 0) + 80,
        },
        data: {
          label: input?.label ?? "Nuevo concepto",
          description: input?.description,
          nodeType,
          source: input?.source ?? "human",
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        },
      };
      const nextEdge: MindMapEdge = {
        id: createLocalId("edge"),
        source: parentId,
        target: id,
        type: "smoothstep",
        data: { createdBy: userId, createdAt: now },
      };

      flow.onNodesChange([{ type: "add", item: nextNode }]);
      flow.onEdgesChange([{ type: "add", item: nextEdge }]);
    },
    [canEdit, flow, nodes, selectedNodeId, userId],
  );

  const deleteSelected = useCallback(() => {
    if (!canEdit) return;
    const selectedNodes = nodes.filter((node) => selectedNodeIdsRef.current.includes(node.id));
    const selectedEdges = edges.filter((edge) => selectedEdgeIdsRef.current.includes(edge.id));

    if (selectedNodes.some((node) => node.id === "node-root")) {
      setNotice("El nodo raiz esta protegido y no se puede eliminar.");
      return;
    }
    if (!selectedNodes.length && !selectedEdges.length) {
      setNotice("Selecciona un nodo o una conexion antes de eliminar.");
      return;
    }

    const nodeIds = new Set(selectedNodes.map((node) => node.id));
    const connectedEdges = edges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target));
    const allEdges = [...selectedEdges, ...connectedEdges].filter(
      (edge, index, collection) => collection.findIndex((candidate) => candidate.id === edge.id) === index,
    );
    setDeleteRequest({ nodes: selectedNodes, edges: allEdges });
  }, [canEdit, edges, nodes]);

  const confirmDelete = useCallback(() => {
    if (!deleteRequest) return;
    flow.onDelete(deleteRequest);
    selectedNodeIdsRef.current = [];
    selectedEdgeIdsRef.current = [];
    setLocalSelectedNodeIds([]);
    setLocalSelectedEdgeIds([]);
    onSelectionChange([]);
    setDeleteRequest(null);
    setNotice(deleteRequest.nodes.length ? "Nodo eliminado correctamente." : "Conexion eliminada correctamente.");
  }, [deleteRequest, flow, onSelectionChange]);

  const onNodesChange = useCallback(
    (changes: NodeChange<MindMapNode>[]) => {
      if (!canEdit) return;
      const storageChanges = changes.filter((change) => change.type !== "select");
      if (storageChanges.length) flow.onNodesChange(storageChanges);
    },
    [canEdit, flow],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<MindMapEdge>[]) => {
      if (!canEdit) return;
      const storageChanges = changes.filter((change) => change.type !== "select");
      if (storageChanges.length) flow.onEdgesChange(storageChanges);
    },
    [canEdit, flow],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!canEdit || !connection.source || !connection.target || flow.isLoading) return;
      const duplicate = edges.some((edge) => edge.source === connection.source && edge.target === connection.target);
      if (duplicate) {
        setNotice("Esa conexion ya existe.");
        return;
      }
      const nextEdge: MindMapEdge = {
        ...connection,
        id: createLocalId("edge"),
        type: "smoothstep",
        data: { createdBy: userId, createdAt: new Date().toISOString() },
      };
      flow.onEdgesChange([{ type: "add", item: nextEdge }]);
    },
    [canEdit, edges, flow, userId],
  );

  const handleSelection = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => {
      const nodeIds = selectedNodes.map((node) => node.id);
      const edgeIds = selectedEdges.map((edge) => edge.id);
      selectedNodeIdsRef.current = nodeIds;
      selectedEdgeIdsRef.current = edgeIds;
      setLocalSelectedNodeIds(nodeIds);
      setLocalSelectedEdgeIds(edgeIds);
      setNotice(undefined);
      onSelectionChange(nodeIds, selectedNodes[0]?.data.label);
    },
    [onSelectionChange],
  );

  const editNode = useCallback(
    (_event: React.MouseEvent, node: MindMapNode) => {
      if (!canEdit) return;
      setEditingNode(node);
      setEditLabel(node.data.label);
      setEditDescription(node.data.description ?? "");
    },
    [canEdit],
  );

  const saveNode = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const label = editLabel.trim();
      if (!editingNode || !label) return;
      flow.onNodesChange([
        {
          id: editingNode.id,
          type: "replace",
          item: {
            ...editingNode,
            data: {
              ...editingNode.data,
              label,
              description: editDescription.trim() || undefined,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      ]);
      setEditingNode(null);
      setNotice("Nodo actualizado correctamente.");
    },
    [editDescription, editLabel, editingNode, flow],
  );

  const fitLayout = useCallback(() => {
    if (!canEdit) return;
    autoLayout(nodes, edges).forEach((node) => {
      flow.onNodesChange([{ id: node.id, type: "replace", item: node }]);
    });
  }, [canEdit, edges, flow, nodes]);

  useEffect(() => {
    registerCanvas({
      addNode: () => addNode(),
      deleteSelected,
      undo,
      autoLayout: fitLayout,
      addSuggestion: (input) => addNode("concept", input.parentNodeId || selectedNodeId || "node-root", { ...input, source: "ai" }),
      getStorage: storage,
    });
  }, [addNode, deleteSelected, fitLayout, registerCanvas, selectedNodeId, storage, undo]);

  useEffect(() => {
    const rootTopic = nodes.find((node) => node.id === "node-root")?.data.label;
    if (rootTopic) {
      onRootTopicChange?.(rootTopic);
    }
  }, [nodes, onRootTopicChange]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(undefined), 3_500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, undo]);

  if (flow.isLoading) {
    return <div className="grid h-full min-h-0 place-items-center text-sm text-slate-500">Cargando storage colaborativo...</div>;
  }

  return (
    <ReactFlowProvider>
      <div className="h-full min-h-0 w-full">
        <ReactFlow
          nodes={renderedNodes}
          edges={renderedEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={handleSelection}
          onNodeDoubleClick={editNode}
          fitView
          nodesDraggable={canEdit}
          nodesConnectable={canEdit && connectMode}
          elementsSelectable
          deleteKeyCode={null}
        >
          <Background gap={24} color="#d7dee8" />
          <Controls position="bottom-left" />
          <Cursors components={{ Cursor: CollaborativeCursor }} />
          {env.enableMinimap ? <MiniMap pannable zoomable nodeStrokeWidth={3} /> : null}
        </ReactFlow>
        {notice ? (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm" role="status">
            {notice}
          </div>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteRequest)}
        title={deleteRequest?.nodes.length ? "Eliminar nodo" : "Eliminar conexion"}
        description={
          deleteRequest?.nodes.length
            ? `Se eliminara "${deleteRequest.nodes[0]?.data.label}" y ${deleteRequest.edges.length} conexion(es) asociada(s).`
            : "La conexion seleccionada se eliminara del mapa colaborativo."
        }
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setDeleteRequest(null)}
      />
      <Dialog
        open={Boolean(editingNode)}
        title="Editar nodo"
        description="Actualiza el contenido visible para todos los participantes."
        onClose={() => setEditingNode(null)}
        footer={
          <>
            <button className="btn btn-secondary" type="button" onClick={() => setEditingNode(null)}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" form="edit-node-form" disabled={!editLabel.trim()}>
              Guardar cambios
            </button>
          </>
        }
      >
        <form id="edit-node-form" className="space-y-4" onSubmit={saveNode}>
          <label className="block text-sm font-medium">
            Titulo
            <input className="field mt-2" value={editLabel} onChange={(event) => setEditLabel(event.target.value)} maxLength={160} autoFocus />
          </label>
          <label className="block text-sm font-medium">
            Descripcion
            <textarea className="field textarea mt-2" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} />
          </label>
        </form>
      </Dialog>
    </ReactFlowProvider>
  );
}
