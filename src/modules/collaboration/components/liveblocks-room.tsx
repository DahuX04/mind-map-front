"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { ReactNode, useMemo, useRef } from "react";
import { requestGuestCollaborationToken } from "@/src/modules/sessions/api/sessions.client";
import { requestCollaborationToken } from "../api/collaboration.client";

export function LiveblocksRoom({
  mapId,
  roomId,
  guestAccess,
  children,
}: {
  mapId: string;
  roomId: string;
  guestAccess?: {
    accessToken: string;
    initialToken?: string;
  };
  children: ReactNode;
}) {
  const initialTokenRef = useRef(guestAccess?.initialToken);
  const guestAccessToken = guestAccess?.accessToken;
  const authEndpoint = useMemo(
    () => async () => {
      if (initialTokenRef.current) {
        const token = initialTokenRef.current;
        initialTokenRef.current = undefined;
        return { token };
      }

      const result = guestAccessToken
        ? await requestGuestCollaborationToken(guestAccessToken)
        : await requestCollaborationToken(mapId);

      if (!result.token) {
        return {
          error: "forbidden",
          reason: "El backend no devolvio un token de Liveblocks.",
        };
      }

      return { token: result.token };
    },
    [guestAccessToken, mapId],
  );

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider id={roomId} initialPresence={{ cursor: null, selectedNodeIds: [], status: "active" }}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
