import { MapEditorPage } from "@/src/modules/maps";

export default async function Page({ params }: { params: Promise<{ mapId: string }> }) {
  const { mapId } = await params;
  return <MapEditorPage mapId={mapId} />;
}
