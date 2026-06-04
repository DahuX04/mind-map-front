import { api } from "@/src/shared/api/http-client";

export type CollaborationTokenResponse = {
  token?: string;
};

export function requestCollaborationToken(mapId: string) {
  return api.post<CollaborationTokenResponse>(`/maps/${mapId}/collaboration-token`);
}
