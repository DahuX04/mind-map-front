"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Users } from "lucide-react";
import { useMaps } from "@/src/modules/maps";
import { useWorkspaceCourses } from "../hooks/use-courses";

export function CoursePage({ courseId, workspaceId }: { courseId: string; workspaceId?: string }) {
  const courses = useWorkspaceCourses(workspaceId);
  const maps = useMaps();
  const course = courses.data?.find((item) => item.id === courseId);
  const courseMaps = useMemo(() => maps.data?.filter((map) => map.courseId === courseId) ?? [], [courseId, maps.data]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Curso</p>
          <h1 className="mt-1 text-3xl font-semibold">{course?.name ?? "Curso"}</h1>
          <p className="mt-2 text-sm text-slate-500">{course?.description ?? "Miembros, mapas vinculados y sesiones de clase."}</p>
        </div>
        <div className="panel flex items-center gap-3 px-4 py-3">
          <Users className="size-5 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs text-slate-500">Rol</p>
            <p className="text-sm font-semibold">teacher</p>
          </div>
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="font-semibold">Mapas del curso</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {courseMaps.map((map) => (
            <Link key={map.id} href={`/maps/${map.id}`} className="rounded-md border border-slate-200 p-4 hover:bg-slate-50">
              <p className="font-medium">{map.title}</p>
              <p className="mt-1 text-xs text-slate-500">{map.description ?? "Sin descripcion"}</p>
            </Link>
          ))}
          {!courseMaps.length ? <p className="text-sm text-slate-500">Aun no hay mapas asociados a este curso.</p> : null}
        </div>
      </section>
    </div>
  );
}
