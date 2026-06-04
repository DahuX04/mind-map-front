import { useQuery } from "@tanstack/react-query";
import { requestCollaborationToken } from "../api/collaboration.client";

export function useCollaborationToken(mapId?: string) {
  return useQuery({
    queryKey: ["maps", mapId, "collaboration-token"],
    queryFn: () => requestCollaborationToken(mapId as string),
    enabled: Boolean(mapId),
    retry: false,
  });
}
