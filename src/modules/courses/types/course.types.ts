export type CourseRole = "teacher" | "student";

export type Course = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  createdBy: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseInput = {
  name: string;
  description?: string;
};
