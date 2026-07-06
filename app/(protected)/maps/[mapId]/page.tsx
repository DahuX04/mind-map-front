import { MapEditorPage } from "@/src/modules/maps";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ mapId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const [{ mapId }, { sessionId }] = await Promise.all([params, searchParams]);
  return <MapEditorPage mapId={mapId} sessionId={sessionId} />;
}
