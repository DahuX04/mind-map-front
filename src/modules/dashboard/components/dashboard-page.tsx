"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, FolderKanban, GraduationCap, LogIn, Map, Plus, Trash2 } from "lucide-react";
import { useArchiveMap, useCreateMap, useMaps } from "@/src/modules/maps";
import { useCreateWorkspace, useDeleteWorkspace, useWorkspaces } from "@/src/modules/workspaces";
import { useArchiveCourse, useCreateCourse, useWorkspaceCourses } from "@/src/modules/courses";
import { useProfile } from "@/src/modules/profiles";
import { EmptyState } from "@/src/shared/components/empty-state";
import { ErrorState } from "@/src/shared/components/error-state";
import { useAuth } from "@/src/shared/auth/use-auth";
import { getUserDisplayName, getUserRole } from "@/src/shared/auth/user-display";
import { formatDate } from "@/src/shared/lib/date";

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `workspace-${Date.now()}`;
}

function inviteTokenFrom(value: string) {
  const cleanValue = value.trim();
  if (!cleanValue) return "";

  try {
    const url = new URL(cleanValue);
    return url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  } catch {
    return cleanValue.replace(/^\/?join\//, "");
  }
}

export function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const profile = useProfile();
  const workspaces = useWorkspaces();
  const maps = useMaps();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const createMap = useCreateMap();
  const archiveMap = useArchiveMap();
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [mapTitle, setMapTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [inviteValue, setInviteValue] = useState("");
  const [lastSync, setLastSync] = useState("Ahora");
  const workspaceList = useMemo(() => workspaces.data ?? [], [workspaces.data]);
  const effectiveSelectedWorkspaceId = selectedWorkspaceId || workspaceList[0]?.id || "";
  const selectedWorkspace = workspaceList.find((workspace) => workspace.id === effectiveSelectedWorkspaceId);
  const courses = useWorkspaceCourses(selectedWorkspace?.id);
  const createCourse = useCreateCourse(selectedWorkspace?.id ?? "");
  const archiveCourse = useArchiveCourse(selectedWorkspace?.id ?? "");
  const courseList = useMemo(() => courses.data ?? [], [courses.data]);
  const effectiveSelectedCourseId = selectedCourseId || courseList[0]?.id || "";
  const selectedCourse = courseList.find((course) => course.id === effectiveSelectedCourseId);
  const role = getUserRole(auth.user);
  const isTeacher = role === "teacher";
  const authName = getUserDisplayName(auth.user);
  const profileName = profile.data?.displayName && !profile.data.displayName.includes("@") ? profile.data.displayName : undefined;

  const recentMaps = useMemo(() => maps.data?.slice(0, 5) ?? [], [maps.data]);

  useEffect(() => {
    queueMicrotask(() => setLastSync(new Date().toLocaleTimeString("es-PE")));
  }, []);

  const submitWorkspace = (event: FormEvent) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    createWorkspace.mutate(
      {
        name,
        slug: toSlug(name),
        type: "personal",
      },
      {
        onSuccess: (workspace) => {
          setWorkspaceName("");
          setSelectedWorkspaceId(workspace.id);
          setSelectedCourseId("");
        },
      },
    );
  };

  const submitCourse = (event: FormEvent) => {
    event.preventDefault();
    const name = courseName.trim();
    if (!selectedWorkspace || !name) return;
    createCourse.mutate(
      {
        name,
        description: courseDescription.trim() || undefined,
      },
      {
        onSuccess: (course) => {
          setCourseName("");
          setCourseDescription("");
          setSelectedCourseId(course.id);
        },
      },
    );
  };

  const submitMap = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedWorkspace || !selectedCourse || !mapTitle.trim()) return;
    createMap.mutate(
      {
        workspaceId: selectedWorkspace.id,
        courseId: selectedCourse.id,
        title: mapTitle.trim(),
      },
      { onSuccess: () => setMapTitle("") },
    );
  };

  const submitInvite = (event: FormEvent) => {
    event.preventDefault();
    const token = inviteTokenFrom(inviteValue);
    if (!token) return;
    router.push(`/join/${token}`);
  };

  const requestDeleteWorkspace = (workspaceId: string, workspaceNameToDelete: string) => {
    if (!window.confirm(`Eliminar el workspace "${workspaceNameToDelete}"? Tambien se eliminaran sus cursos y mapas.`)) return;
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        if (workspaceId === effectiveSelectedWorkspaceId) {
          setSelectedWorkspaceId("");
          setSelectedCourseId("");
        }
      },
    });
  };

  const requestArchiveCourse = (courseId: string, courseNameToArchive: string) => {
    if (!selectedWorkspace || !window.confirm(`Eliminar el curso "${courseNameToArchive}"? Los canvas vinculados quedaran sin curso.`)) return;
    archiveCourse.mutate(courseId, {
      onSuccess: () => {
        if (courseId === effectiveSelectedCourseId) {
          setSelectedCourseId("");
        }
      },
    });
  };

  const requestArchiveMap = (mapId: string, mapName: string) => {
    if (!window.confirm(`Eliminar el canvas "${mapName}"? Se archivara y dejara de aparecer en la lista.`)) return;
    archiveMap.mutate(mapId);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">Hola, {profileName ?? authName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isTeacher ? "Gestiona workspaces, cursos, mapas y sesiones colaborativas." : "Entra a tus mapas colaborativos y acepta invitaciones de clase."}
          </p>
        </div>
        <div className="panel flex items-center gap-3 px-4 py-3">
          <Clock className="size-5 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs text-slate-500">Ultima sincronizacion</p>
            <p className="text-sm font-semibold">{lastSync}</p>
          </div>
        </div>
      </section>

      {isTeacher ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <form className="panel p-4" onSubmit={submitWorkspace}>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Paso 1</p>
            <h2 className="mt-1 font-semibold">Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">Elige uno existente o crea uno nuevo.</p>
            <div className="mt-4 space-y-3">
              <select className="field" value={effectiveSelectedWorkspaceId} onChange={(event) => { setSelectedWorkspaceId(event.target.value); setSelectedCourseId(""); }}>
                {workspaceList.length ? null : <option value="">Sin workspaces</option>}
                {workspaceList.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <input className="field" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Piloto Colegio Central" />
              <button className="btn btn-primary w-full" type="submit" disabled={createWorkspace.isPending}>
                <Plus className="size-4" aria-hidden />
                Crear workspace
              </button>
            </div>
          </form>

          <form className="panel p-4" onSubmit={submitCourse}>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Paso 2</p>
            <h2 className="mt-1 font-semibold">Curso</h2>
            <p className="mt-1 text-sm text-slate-500">Crea un curso nuevo dentro de {selectedWorkspace?.name ?? "un workspace"}.</p>
            <div className="mt-4 space-y-3">
              <input className="field" value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Historia Universal" disabled={!selectedWorkspace} />
              <input
                className="field"
                value={courseDescription}
                onChange={(event) => setCourseDescription(event.target.value)}
                placeholder="Descripcion opcional"
                disabled={!selectedWorkspace}
              />
              <button className="btn btn-primary w-full" type="submit" disabled={!selectedWorkspace || createCourse.isPending}>
                <BookOpen className="size-4" aria-hidden />
                Crear curso
              </button>
            </div>
          </form>

          <form className="panel p-4" onSubmit={submitMap}>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Paso 3</p>
            <h2 className="mt-1 font-semibold">Canvas</h2>
            <p className="mt-1 text-sm text-slate-500">Usa el workspace y curso seleccionados; no necesitas crear otro curso.</p>
            <div className="mt-4 space-y-3">
              <select className="field" value={effectiveSelectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} disabled={!courseList.length}>
                {courseList.length ? null : <option value="">Sin cursos en este workspace</option>}
                {courseList.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <input className="field" value={mapTitle} onChange={(event) => setMapTitle(event.target.value)} placeholder="Segunda Guerra Mundial" disabled={!selectedCourse} />
              <button className="btn btn-primary w-full" type="submit" disabled={!selectedWorkspace || !selectedCourse || createMap.isPending}>
                <Map className="size-4" aria-hidden />
                Crear canvas
              </button>
            </div>
          </form>
        </section>
      ) : (
        <form className="panel p-4" onSubmit={submitInvite}>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-teal-100 text-teal-800">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Modo alumno</h2>
              <p className="mt-1 text-sm text-slate-500">Pega el enlace o token que te dio tu profesor para unirte al canvas.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input className="field" value={inviteValue} onChange={(event) => setInviteValue(event.target.value)} placeholder="https://.../join/token o token" />
            <button className="btn btn-primary sm:w-44" type="submit">
              <LogIn className="size-4" aria-hidden />
              Unirme
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Map className="size-5 text-teal-700" aria-hidden />
              Mapas recientes
            </h2>
            <span className="text-xs text-slate-500">{maps.data?.length ?? 0} activos</span>
          </div>
          {maps.error ? <div className="mt-4"><ErrorState error={maps.error} /></div> : null}
          {recentMaps.length === 0 && !maps.isLoading ? (
            <div className="mt-4">
              <EmptyState title="Aun no hay mapas" description="Crea tu primer mapa para abrir el editor colaborativo." />
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {recentMaps.map((map) => (
                <div key={map.id} className="flex items-center justify-between gap-4 py-3">
                  <Link href={`/maps/${map.id}`} className="min-w-0 flex-1 hover:text-teal-700">
                    <p className="truncate font-medium">{map.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Actualizado {formatDate(map.updatedAt)}
                      {map.course?.name ? ` - ${map.course.name}` : ""}
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold">{map.permission ?? "owner"}</span>
                    {isTeacher && (map.permission ?? "owner") === "owner" ? (
                      <button
                        className="btn btn-secondary size-9 p-0 text-red-700"
                        type="button"
                        onClick={() => requestArchiveMap(map.id, map.title)}
                        disabled={archiveMap.isPending}
                        aria-label={`Eliminar ${map.title}`}
                        title="Eliminar canvas"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <FolderKanban className="size-5 text-slate-700" aria-hidden />
              Workspaces
            </h2>
            <div className="mt-4 space-y-3">
              {workspaceList.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <Link href={`/workspaces/${workspace.id}`} className="min-w-0 hover:text-teal-700">
                    <p className="truncate font-medium">{workspace.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{workspace.type}</p>
                  </Link>
                  {isTeacher ? (
                    <button
                      className="btn btn-secondary size-9 shrink-0 p-0 text-red-700"
                      type="button"
                      onClick={() => requestDeleteWorkspace(workspace.id, workspace.name)}
                      disabled={deleteWorkspace.isPending}
                      aria-label={`Eliminar ${workspace.name}`}
                      title="Eliminar workspace"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <BookOpen className="size-5 text-slate-700" aria-hidden />
              Cursos
            </h2>
            <div className="mt-4 space-y-3">
              {courseList.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <Link href={`/courses/${course.id}?workspaceId=${course.workspaceId}`} className="min-w-0 hover:text-teal-700">
                    <p className="truncate font-medium">{course.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{course.description ?? "Sin descripcion"}</p>
                  </Link>
                  {isTeacher ? (
                    <button
                      className="btn btn-secondary size-9 shrink-0 p-0 text-red-700"
                      type="button"
                      onClick={() => requestArchiveCourse(course.id, course.name)}
                      disabled={archiveCourse.isPending}
                      aria-label={`Eliminar ${course.name}`}
                      title="Eliminar curso"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
              {!courseList.length ? <p className="text-sm text-slate-500">Sin cursos en el workspace seleccionado.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
