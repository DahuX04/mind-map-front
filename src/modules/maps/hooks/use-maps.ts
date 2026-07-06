import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMapMember,
  archiveMap,
  createMap,
  getMapById,
  listMapMembers,
  listMaps,
  removeMapMember,
  updateMap,
  updateMapMember,
} from "../api/maps.client";

export function useMaps() {
  return useQuery({
    queryKey: ["maps"],
    queryFn: listMaps,
  });
}

export function useUpdateMap(mapId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title?: string; description?: string; editingLocked?: boolean }) => updateMap(mapId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maps", mapId] });
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
  });
}

export function useMapMembers(mapId: string) {
  return useQuery({
    queryKey: ["maps", mapId, "members"],
    queryFn: () => listMapMembers(mapId),
    enabled: Boolean(mapId),
  });
}

export function useManageMapMembers(mapId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["maps", mapId, "members"] });
  return {
    add: useMutation({
      mutationFn: (input: { userId: string; permission: "editor" | "viewer" }) => addMapMember(mapId, input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (input: { userId: string; permission: "editor" | "viewer" }) =>
        updateMapMember(mapId, input.userId, input.permission),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => removeMapMember(mapId, userId),
      onSuccess: invalidate,
    }),
  };
}

export function useMap(mapId?: string) {
  return useQuery({
    queryKey: ["maps", mapId],
    queryFn: () => getMapById(mapId as string),
    enabled: Boolean(mapId),
  });
}

export function useCreateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maps"] }),
  });
}

export function useArchiveMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveMap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maps"] }),
  });
}
