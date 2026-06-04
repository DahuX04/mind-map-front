import { api } from "@/src/shared/api/http-client";
import type { CreateWorkspaceInput, Workspace } from "../types/workspace.types";

export function listWorkspaces() {
  return api.get<Workspace[]>("/workspaces");
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return api.post<Workspace>("/workspaces", input);
}

export function deleteWorkspace(workspaceId: string) {
  return api.delete<Workspace>(`/workspaces/${workspaceId}`);
}
