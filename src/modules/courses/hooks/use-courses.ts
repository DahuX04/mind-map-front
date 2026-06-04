import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveCourse, createCourse, listWorkspaceCourses } from "../api/courses.client";
import type { CreateCourseInput } from "../types/course.types";

export function useWorkspaceCourses(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "courses"],
    queryFn: () => listWorkspaceCourses(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateCourse(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(workspaceId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "courses"] }),
  });
}

export function useArchiveCourse(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => archiveCourse(workspaceId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "courses"] });
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
  });
}
