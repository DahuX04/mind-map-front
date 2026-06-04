import { JoinInvitePage } from "@/src/modules/sessions";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <JoinInvitePage token={token} />;
}
