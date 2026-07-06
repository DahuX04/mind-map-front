import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWorkspaceMember,
  createWorkspace,
  deleteWorkspace,
  listWorkspaceMembers,
  listWorkspaces,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "../api/workspaces.client";
import type { WorkspaceRole } from "../types/workspace.types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: () => listWorkspaceMembers(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useManageWorkspaceMembers(workspaceId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });

  return {
    add: useMutation({
      mutationFn: (input: { userId: string; role: WorkspaceRole }) => addWorkspaceMember(workspaceId, input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (input: { userId: string; role: WorkspaceRole }) =>
        updateWorkspaceMember(workspaceId, input.userId, input.role),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => removeWorkspaceMember(workspaceId, userId),
      onSuccess: invalidate,
    }),
  };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
  });
}
