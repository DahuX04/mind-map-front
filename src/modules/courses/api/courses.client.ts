import { api } from "@/src/shared/api/http-client";
import type { Course, CreateCourseInput } from "../types/course.types";

export function listWorkspaceCourses(workspaceId: string) {
  return api.get<Course[]>(`/workspaces/${workspaceId}/courses`);
}

export function createCourse(workspaceId: string, input: CreateCourseInput) {
  return api.post<Course>(`/workspaces/${workspaceId}/courses`, input);
}

export function archiveCourse(workspaceId: string, courseId: string) {
  return api.delete<Course>(`/workspaces/${workspaceId}/courses/${courseId}`);
}
