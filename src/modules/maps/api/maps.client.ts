import { api } from "@/src/shared/api/http-client";
import type { CreateMapInput, MindMapRecord } from "../types/map.types";

export function listMaps() {
  return api.get<MindMapRecord[]>("/maps");
}

export function getMapById(mapId: string) {
  return api.get<MindMapRecord>(`/maps/${mapId}`);
}

export function createMap(input: CreateMapInput) {
  return api.post<MindMapRecord>("/maps", input);
}

export function archiveMap(mapId: string) {
  return api.delete<MindMapRecord>(`/maps/${mapId}`);
}
