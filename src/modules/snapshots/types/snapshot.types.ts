export type MapSnapshot = {
  id: string;
  mapId: string;
  schemaVersion: number;
  reason: "initial" | "manual" | "session_end" | "auto_checkpoint" | "migration" | "restore";
  canvasState: unknown;
  createdBy?: string | null;
  createdAt: string;
};
