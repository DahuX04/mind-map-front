"use client";

import {
  Background,
  Connection,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type NodeChange,
} from "@xyflow/react";
import { useOthers, useUndo } from "@liveblocks/react";
import { Cursors, type CursorsCursorProps, useLiveblocksFlow } from "@liveblocks/react-flow";
import { useCallback, useEffect, useMemo } from "react";
import { env } from "@/src/shared/config/env";
import { formatPresenceName } from "@/src/shared/auth/user-display";
import { createLocalId } from "@/src/shared/lib/ids";
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
  const flow = useLiveblocksFlow<MindMapNode, MindMapEdge>({
    nodes: { initial: initial.nodes },
    edges: { initial: initial.edges },
  });
  const nodes = flow.nodes ?? initial.nodes;
  const edges = flow.edges ?? initial.edges;

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
    if (!canEdit || !selectedNodeId) return;
    const deletable = selectedNodeId === "node-root" ? [] : [selectedNodeId];
    if (selectedNodeId === "node-root") {
      window.alert("El nodo raiz no puede eliminarse.");
    }
    if (deletable.length === 0) return;

    flow.onNodesChange(deletable.map((id) => ({ id, type: "remove" })));
    flow.onEdgesChange(
      edges
        .filter((edge) => deletable.includes(edge.source) || deletable.includes(edge.target))
        .map((edge) => ({ id: edge.id, type: "remove" })),
    );
    onSelectionChange([]);
  }, [canEdit, edges, flow, onSelectionChange, selectedNodeId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<MindMapNode>[]) => {
      if (!canEdit) return;
      flow.onNodesChange(changes);
    },
    [canEdit, flow],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!canEdit || !connection.source || !connection.target || flow.isLoading) return;
      const duplicate = edges.some((edge) => edge.source === connection.source && edge.target === connection.target);
      if (duplicate) {
        window.alert("La conexion ya existe.");
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
    ({ nodes: selectedNodes }: { nodes: MindMapNode[] }) => {
      const ids = selectedNodes.map((node) => node.id);
      onSelectionChange(ids, selectedNodes[0]?.data.label);
    },
    [onSelectionChange],
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
    return <div className="grid h-full min-h-[520px] place-items-center text-sm text-slate-500">Cargando storage colaborativo...</div>;
  }

  return (
    <ReactFlowProvider>
      <div className="h-full min-h-[520px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={canEdit ? flow.onEdgesChange : undefined}
          onDelete={canEdit ? flow.onDelete : undefined}
          onConnect={onConnect}
          onSelectionChange={handleSelection}
          fitView
          nodesDraggable={canEdit}
          nodesConnectable={canEdit}
          elementsSelectable
        >
          <Background gap={24} color="#d7dee8" />
          <Controls position="bottom-left" />
          <Cursors components={{ Cursor: CollaborativeCursor }} />
          {env.enableMinimap ? <MiniMap pannable zoomable nodeStrokeWidth={3} /> : null}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
