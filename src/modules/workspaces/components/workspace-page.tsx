"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useCreateCourse, useWorkspaceCourses } from "@/src/modules/courses";
import { useMaps } from "@/src/modules/maps";
import { useWorkspaces } from "../hooks/use-workspaces";

export function WorkspacePage({ workspaceId }: { workspaceId: string }) {
  const workspaces = useWorkspaces();
  const courses = useWorkspaceCourses(workspaceId);
  const maps = useMaps();
  const createCourse = useCreateCourse(workspaceId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const workspace = workspaces.data?.find((item) => item.id === workspaceId);
  const workspaceMaps = useMemo(() => maps.data?.filter((map) => map.workspaceId === workspaceId) ?? [], [maps.data, workspaceId]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    createCourse.mutate({ name: name.trim(), description: description.trim() || undefined }, { onSuccess: () => {
      setName("");
      setDescription("");
    } });
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-teal-700">Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold">{workspace?.name ?? "Workspace"}</h1>
        <p className="mt-2 text-sm text-slate-500">Cursos, mapas institucionales y sesiones del piloto.</p>
      </section>

      <form className="panel p-4" onSubmit={submit}>
        <h2 className="font-semibold">Crear curso</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Biologia 4to B" />
          <input className="field" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion opcional" />
          <button className="btn btn-primary" type="submit" disabled={createCourse.isPending}>
            <Plus className="size-4" aria-hidden />
            Crear
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <BookOpen className="size-5 text-teal-700" aria-hidden />
            Cursos
          </h2>
          <div className="mt-4 space-y-3">
            {(courses.data ?? []).map((course) => (
              <Link key={course.id} href={`/courses/${course.id}?workspaceId=${workspaceId}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <p className="font-medium">{course.name}</p>
                <p className="mt-1 text-xs text-slate-500">{course.description ?? "Sin descripcion"}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="font-semibold">Mapas vinculados</h2>
          <div className="mt-4 space-y-3">
            {workspaceMaps.map((map) => (
              <Link key={map.id} href={`/maps/${map.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <p className="font-medium">{map.title}</p>
                <p className="mt-1 text-xs text-slate-500">{map.permission ?? "owner"}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
