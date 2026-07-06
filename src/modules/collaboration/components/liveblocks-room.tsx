"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { ReactNode, useMemo } from "react";
import { requestCollaborationToken } from "../api/collaboration.client";

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
      const result = await requestCollaborationToken(mapId);

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
