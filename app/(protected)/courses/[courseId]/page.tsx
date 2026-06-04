import { CoursePage } from "@/src/modules/courses";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const [{ courseId }, { workspaceId }] = await Promise.all([params, searchParams]);
  return <CoursePage courseId={courseId} workspaceId={workspaceId} />;
}
