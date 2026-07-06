import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSnapshots, restoreSnapshot } from "../api/snapshots.client";

export function useSnapshots(mapId: string, enabled = true) {
  return useQuery({
    queryKey: ["maps", mapId, "snapshots"],
    queryFn: () => listSnapshots(mapId),
    enabled: enabled && Boolean(mapId),
  });
}

export function useRestoreSnapshot(mapId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snapshotId: string) => restoreSnapshot(mapId, snapshotId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maps", mapId, "snapshots"] }),
  });
}
