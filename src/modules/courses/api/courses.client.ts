import { api } from "@/src/shared/api/http-client";
import type { Course, CourseMember, CourseRole, CreateCourseInput } from "../types/course.types";

export function listWorkspaceCourses(workspaceId: string) {
  return api.get<Course[]>(`/workspaces/${workspaceId}/courses`);
}

export function createCourse(workspaceId: string, input: CreateCourseInput) {
  return api.post<Course>(`/workspaces/${workspaceId}/courses`, input);
}

export function archiveCourse(workspaceId: string, courseId: string) {
  return api.delete<Course>(`/workspaces/${workspaceId}/courses/${courseId}`);
}

export function getCourse(courseId: string) {
  return api.get<Course>(`/courses/${courseId}`);
}

export function listCourseMembers(courseId: string) {
  return api.get<CourseMember[]>(`/courses/${courseId}/members`);
}

export function addCourseMember(courseId: string, input: { userId: string; role: CourseRole }) {
  return api.post<CourseMember>(`/courses/${courseId}/members`, input);
}

export function updateCourseMember(courseId: string, userId: string, role: CourseRole) {
  return api.patch<CourseMember>(`/courses/${courseId}/members/${userId}`, { role });
}

export function removeCourseMember(courseId: string, userId: string) {
  return api.delete<{ removed: true }>(`/courses/${courseId}/members/${userId}`);
}
