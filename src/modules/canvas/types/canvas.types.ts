import type { Edge, Node } from "@xyflow/react";

export type MindMapNodeType = "root" | "concept" | "question" | "example" | "ai-suggestion";

export type MindMapNodeData = {
  label: string;
  description?: string;
  nodeType: MindMapNodeType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  source?: "human" | "ai";
  colorToken?: string;
  collapsed?: boolean;
};

export type MindMapNode = Node<MindMapNodeData, "mindMapNode">;

export type MindMapEdgeData = {
  createdBy: string;
  createdAt: string;
};

export type MindMapEdge = Edge<MindMapEdgeData>;

export type CanvasStorage = {
  schemaVersion: number;
  rootNodeId: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
};

export type CanvasPresence = {
  cursor: { x: number; y: number } | null;
  selectedNodeIds: string[];
  displayName: string;
  avatarUrl?: string;
  role: "teacher" | "student";
  status: "active" | "idle";
};

export type CollaborationStatus = "connecting" | "connected" | "reconnecting" | "synchronized" | "error";
