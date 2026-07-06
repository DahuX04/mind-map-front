import { api } from "@/src/shared/api/http-client";
import type { CanvasStorage } from "@/src/modules/canvas";
import type { MapSnapshot } from "../types/snapshot.types";

export function listSnapshots(mapId: string) {
  return api.get<MapSnapshot[]>(`/maps/${mapId}/snapshots`);
}

export function createSnapshot(mapId: string, canvasState: CanvasStorage) {
  return api.post<MapSnapshot>(`/maps/${mapId}/snapshots`, {
    reason: "manual",
    schemaVersion: canvasState.schemaVersion,
    canvasState,
  });
}

export function getSnapshot(mapId: string, snapshotId: string) {
  return api.get<MapSnapshot>(`/maps/${mapId}/snapshots/${snapshotId}`);
}

export function restoreSnapshot(mapId: string, snapshotId: string) {
  return api.post<{ snapshot: MapSnapshot; provider: unknown }>(`/maps/${mapId}/snapshots/${snapshotId}/restore`);
}
