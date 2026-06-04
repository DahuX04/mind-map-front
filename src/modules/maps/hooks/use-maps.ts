import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveMap, createMap, getMapById, listMaps } from "../api/maps.client";

export function useMaps() {
  return useQuery({
    queryKey: ["maps"],
    queryFn: listMaps,
  });
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
