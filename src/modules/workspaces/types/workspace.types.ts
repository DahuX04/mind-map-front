export type WorkspaceRole = "owner" | "admin" | "teacher" | "student";
export type WorkspaceType = "personal" | "institution";

export type Workspace = {
  id: string;
  type: WorkspaceType;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceInput = {
  name: string;
  slug: string;
  type?: WorkspaceType;
};

export type WorkspaceMember = {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  };
};
