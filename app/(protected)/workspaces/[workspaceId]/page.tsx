import { WorkspacePage } from "@/src/modules/workspaces";

export default async function Page({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <WorkspacePage workspaceId={workspaceId} />;
}
