import type { MapPermission } from "@/src/modules/maps";

export type CollaborationSession = {
  id: string;
  mapId: string;
  title?: string | null;
  status: "scheduled" | "active" | "ended" | "cancelled";
  startsAt?: string | null;
  endsAt?: string | null;
  maxParticipants: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MapInvite = {
  id: string;
  mapId: string;
  sessionId?: string | null;
  token: string;
  permission: MapPermission;
  status: "active" | "revoked" | "consumed" | "expired";
  expiresAt?: string | null;
  maxUses?: number | null;
  useCount: number;
  createdBy: string;
  createdAt: string;
};

export type ResolvedInvite = {
  invite: {
    id: string;
    permission: MapPermission;
    status: "active" | "revoked" | "consumed" | "expired";
    expiresAt?: string | null;
    maxUses?: number | null;
    useCount: number;
  };
  map: {
    id: string;
    title: string;
    description?: string | null;
    liveblocksRoomId: string;
    workspaceId: string;
    courseId?: string | null;
  };
  session: {
    id: string;
    title?: string | null;
    status: "scheduled" | "active" | "ended" | "cancelled";
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
};

export type AcceptedInvite = {
  mapId: string;
  permission: MapPermission;
  accepted: true;
  redirectTo: string;
};
