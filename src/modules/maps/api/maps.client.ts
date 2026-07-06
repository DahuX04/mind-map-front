import { api } from "@/src/shared/api/http-client";
import type { CreateMapInput, MapMember, MindMapRecord } from "../types/map.types";

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

export function updateMap(mapId: string, input: { title?: string; description?: string; editingLocked?: boolean }) {
  return api.patch<MindMapRecord>(`/maps/${mapId}`, input);
}

export function listMapMembers(mapId: string) {
  return api.get<MapMember[]>(`/maps/${mapId}/members`);
}

export function addMapMember(mapId: string, input: { userId: string; permission: "editor" | "viewer" }) {
  return api.post<MapMember>(`/maps/${mapId}/members`, input);
}

export function updateMapMember(mapId: string, userId: string, permission: "editor" | "viewer") {
  return api.patch<MapMember>(`/maps/${mapId}/members/${userId}`, { permission });
}

export function removeMapMember(mapId: string, userId: string) {
  return api.delete<{ removed: true }>(`/maps/${mapId}/members/${userId}`);
}
