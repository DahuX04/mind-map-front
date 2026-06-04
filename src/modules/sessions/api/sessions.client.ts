import { api } from "@/src/shared/api/http-client";
import type { AcceptedInvite, CollaborationSession, MapInvite, ResolvedInvite } from "../types/session.types";

export function createSession(mapId: string, input: { title?: string; maxParticipants?: number }) {
  return api.post<CollaborationSession>(`/maps/${mapId}/sessions`, input);
}

export function createInvite(mapId: string, input: { sessionId?: string; permission?: "editor" | "viewer"; maxUses?: number }) {
  return api.post<MapInvite>(`/maps/${mapId}/invites`, input);
}

export function resolveInvite(token: string) {
  return api.post<ResolvedInvite>(`/invites/${token}/resolve`, undefined, { auth: false });
}

export function acceptInvite(token: string) {
  return api.post<AcceptedInvite>(`/invites/${token}/accept`);
}
