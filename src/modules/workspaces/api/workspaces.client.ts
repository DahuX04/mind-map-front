import { api } from "@/src/shared/api/http-client";
import type { CreateWorkspaceInput, Workspace, WorkspaceMember, WorkspaceRole } from "../types/workspace.types";

export function listWorkspaces() {
  return api.get<Workspace[]>("/workspaces");
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return api.post<Workspace>("/workspaces", input);
}

export function deleteWorkspace(workspaceId: string) {
  return api.delete<Workspace>(`/workspaces/${workspaceId}`);
}

export function listWorkspaceMembers(workspaceId: string) {
  return api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
}

export function addWorkspaceMember(workspaceId: string, input: { userId: string; role: WorkspaceRole }) {
  return api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, input);
}

export function updateWorkspaceMember(workspaceId: string, userId: string, role: WorkspaceRole) {
  return api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}`, { role });
}

export function removeWorkspaceMember(workspaceId: string, userId: string) {
  return api.delete<{ removed: true }>(`/workspaces/${workspaceId}/members/${userId}`);
}
