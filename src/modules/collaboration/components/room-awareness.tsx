"use client";

import { useEffect, useState } from "react";
import { useOthers, useStatus } from "@liveblocks/react";
import { WifiOff, Users } from "lucide-react";
import { sendSessionHeartbeat } from "@/src/modules/sessions";
import { CollaborationStatusBadge, type CollaborationStatus } from "@/src/modules/canvas";

const statusMap: Record<string, CollaborationStatus> = {
  initial: "connecting",
  connecting: "connecting",
  connected: "synchronized",
  reconnecting: "reconnecting",
  disconnected: "error",
};

export function RoomAwareness({ sessionId }: { sessionId?: string }) {
  const roomStatus = useStatus();
  const others = useOthers();
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!sessionId || roomStatus !== "connected") return;
    const heartbeat = () => void sendSessionHeartbeat(sessionId).catch(() => undefined);
    heartbeat();
    const interval = window.setInterval(heartbeat, 45_000);
    return () => window.clearInterval(interval);
  }, [roomStatus, sessionId]);

  const status = online ? (statusMap[roomStatus] ?? "connecting") : "reconnecting";

  return (
    <>
      <div className="flex shrink-0 items-center gap-2" aria-label="Estado de colaboracion">
        <CollaborationStatusBadge status={status} />
        <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700" title={`${others.length + 1} participantes conectados`}>
          <Users className="size-4" aria-hidden />
          <span>{others.length + 1}</span>
          <span className="hidden xl:inline">conectados</span>
        </div>
      </div>
      {!online ? (
        <div className="fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 shadow-sm" role="status">
          <WifiOff className="size-4" aria-hidden />
          Sin conexion. Conservamos el canvas visible y sincronizaremos al reconectar.
        </div>
      ) : null}
    </>
  );
}
