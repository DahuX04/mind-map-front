import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCourseMember,
  archiveCourse,
  createCourse,
  getCourse,
  listCourseMembers,
  listWorkspaceCourses,
  removeCourseMember,
  updateCourseMember,
} from "../api/courses.client";
import type { CourseRole, CreateCourseInput } from "../types/course.types";

export function useWorkspaceCourses(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "courses"],
    queryFn: () => listWorkspaceCourses(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => getCourse(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCourseMembers(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId, "members"],
    queryFn: () => listCourseMembers(courseId),
    enabled: Boolean(courseId),
  });
}

export function useManageCourseMembers(courseId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["courses", courseId, "members"] });

  return {
    add: useMutation({
      mutationFn: (input: { userId: string; role: CourseRole }) => addCourseMember(courseId, input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (input: { userId: string; role: CourseRole }) => updateCourseMember(courseId, input.userId, input.role),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => removeCourseMember(courseId, userId),
      onSuccess: invalidate,
    }),
  };
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
