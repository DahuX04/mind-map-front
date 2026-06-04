import type { CanvasStorage } from "../types/canvas.types";

const now = new Date().toISOString();

export function createInitialCanvas(title: string, userId: string): CanvasStorage {
  return {
    schemaVersion: 1,
    rootNodeId: "node-root",
    nodes: [
      {
        id: "node-root",
        type: "mindMapNode",
        position: { x: 0, y: 0 },
        data: {
          label: title || "Mapa mental",
          nodeType: "root",
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
          source: "human",
          colorToken: "root",
        },
      },
    ],
    edges: [],
  };
}
