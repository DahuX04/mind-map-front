export type MapPermission = "owner" | "editor" | "viewer";
export type MapStatus = "active" | "archived";

export type MindMapRecord = {
  id: string;
  workspaceId: string;
  courseId?: string | null;
  title: string;
  description?: string | null;
  ownerId: string;
  liveblocksRoomId: string;
  canvasSchemaVersion: number;
  status: MapStatus;
  permission?: MapPermission;
  editingLocked?: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  workspace?: {
    id: string;
    type: "personal" | "institution";
    name: string;
    slug: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  course?: {
    id: string;
    workspaceId: string;
    name: string;
    description?: string | null;
    createdBy: string;
    archivedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  members?: Array<{
    mapId: string;
    userId: string;
    permission: MapPermission;
    grantedBy: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type MapMember = {
  mapId: string;
  userId: string;
  permission: MapPermission;
  grantedBy: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  };
};

export type CreateMapInput = {
  workspaceId: string;
  courseId?: string;
  title: string;
  description?: string;
};
