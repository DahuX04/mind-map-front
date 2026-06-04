"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { ReactNode, useMemo } from "react";
import { api } from "@/src/shared/api/http-client";

type CollaborationAuthResponse = {
  token?: string;
  roomId?: string;
};

export function LiveblocksRoom({
  mapId,
  roomId,
  children,
}: {
  mapId: string;
  roomId: string;
  children: ReactNode;
}) {
  const authEndpoint = useMemo(
    () => async () => {
      const result = await api.post<CollaborationAuthResponse>(`/maps/${mapId}/collaboration-token`);

      if (!result.token) {
        return {
          error: "forbidden",
          reason: "El backend no devolvio un token de Liveblocks.",
        };
      }

      return { token: result.token };
    },
    [mapId],
  );

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider id={roomId} initialPresence={{ cursor: null, selectedNodeIds: [], status: "active" }}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
