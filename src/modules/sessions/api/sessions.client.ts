import { api } from "@/src/shared/api/http-client";
import type {
  AcceptedInvite,
  CollaborationSession,
  CreateInviteInput,
  CreateSessionInput,
  EndedSession,
  GuestAccess,
  GuestCollaborationToken,
  JoinedSession,
  MapInvite,
  ResolvedInvite,
  SessionMetrics,
} from "../types/session.types";

export function createSession(mapId: string, input: CreateSessionInput) {
  return api.post<CollaborationSession>(`/maps/${mapId}/sessions`, input);
}

export function listSessions(mapId: string) {
  return api.get<CollaborationSession[]>(`/maps/${mapId}/sessions`);
}

export function startSession(sessionId: string) {
  return api.post<CollaborationSession>(`/sessions/${sessionId}/start`);
}

export function endSession(sessionId: string, canvasState?: Record<string, unknown>) {
  return api.post<EndedSession>(`/sessions/${sessionId}/end`, canvasState ? { canvasState, schemaVersion: 1 } : {});
}

export function joinSessionByCode(code: string) {
  return api.post<JoinedSession>("/sessions/join-by-code", { code: code.trim().toUpperCase() });
}

export function sendSessionHeartbeat(sessionId: string) {
  return api.post<{ active: true }>(`/sessions/${sessionId}/heartbeat`);
}

export function getSessionMetrics(sessionId: string) {
  return api.get<SessionMetrics>(`/sessions/${sessionId}/metrics`);
}

export function createInvite(mapId: string, input: CreateInviteInput) {
  return api.post<MapInvite>(`/maps/${mapId}/invites`, input);
}

export function resolveInvite(token: string) {
  return api.post<ResolvedInvite>(`/invites/${token}/resolve`, undefined, { auth: false });
}

export function acceptInvite(token: string) {
  return api.post<AcceptedInvite>(`/invites/${token}/accept`);
}

export function joinInviteAsGuest(token: string, displayName: string) {
  return api.post<GuestAccess>(
    `/invites/${encodeURIComponent(token)}/guest-access`,
    { displayName: displayName.trim() },
    { auth: false },
  );
}

export function requestGuestCollaborationToken(accessToken: string) {
  return api.post<GuestCollaborationToken>("/guest/collaboration-token", undefined, {
    auth: false,
    headers: { Authorization: `Guest ${accessToken}` },
  });
}

export function revokeInvite(inviteId: string) {
  return api.delete<MapInvite>(`/invites/${inviteId}`);
}
