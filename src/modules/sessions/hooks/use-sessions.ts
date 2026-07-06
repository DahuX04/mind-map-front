import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvite,
  createSession,
  endSession,
  getSessionMetrics,
  joinSessionByCode,
  listSessions,
  startSession,
} from "../api/sessions.client";
import type { CreateInviteInput, CreateSessionInput } from "../types/session.types";

export function useSessions(mapId: string) {
  return useQuery({
    queryKey: ["maps", mapId, "sessions"],
    queryFn: () => listSessions(mapId),
    enabled: Boolean(mapId),
  });
}

export function useCreateSession(mapId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(mapId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maps", mapId, "sessions"] }),
  });
}

export function useStartSession(mapId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maps", mapId, "sessions"] }),
  });
}

export function useEndSession(mapId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, canvasState }: { sessionId: string; canvasState: Record<string, unknown> }) =>
      endSession(sessionId, canvasState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maps", mapId, "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["maps", mapId, "snapshots"] });
    },
  });
}

export function useCreateInvite(mapId: string) {
  return useMutation({
    mutationFn: (input: CreateInviteInput) => createInvite(mapId, input),
  });
}

export function useJoinSessionByCode() {
  return useMutation({ mutationFn: joinSessionByCode });
}

export function useSessionMetrics(sessionId?: string) {
  return useQuery({
    queryKey: ["sessions", sessionId, "metrics"],
    queryFn: () => getSessionMetrics(sessionId as string),
    enabled: Boolean(sessionId),
    refetchInterval: 30_000,
  });
}
