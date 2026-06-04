"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Lock, Map, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptInvite, resolveInvite } from "../api/sessions.client";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { useAuth } from "@/src/shared/auth/use-auth";
import { formatDate } from "@/src/shared/lib/date";

export function JoinInvitePage({ token }: { token: string }) {
  const router = useRouter();
  const auth = useAuth();
  const invite = useQuery({
    queryKey: ["invites", token, "resolve"],
    queryFn: () => resolveInvite(token),
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () => acceptInvite(token),
    onSuccess: (result) => router.push(result.redirectTo),
  });

  const needsLogin = auth.configured && !auth.loading && !auth.user;

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--app-bg)] px-4 py-8">
      <section className="panel w-full max-w-2xl p-6">
        <p className="text-sm font-medium text-teal-700">Invitacion colaborativa</p>
        <h1 className="mt-2 text-3xl font-semibold">Unete a MindMap Live</h1>

        {invite.isLoading ? (
          <p className="mt-6 text-sm text-slate-500">Validando invitacion...</p>
        ) : null}

        {invite.error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
            <p className="font-semibold">No se pudo abrir la invitacion</p>
            <p className="mt-1 text-sm leading-6">{getErrorMessage(invite.error)}</p>
            <Link className="btn btn-secondary mt-4" href="/dashboard">
              Volver
            </Link>
          </div>
        ) : null}

        {invite.data ? (
          <div className="mt-6 space-y-4">
            <article className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <Map className="mt-1 size-5 text-teal-700" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold">{invite.data.map.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{invite.data.map.description ?? "Mapa mental colaborativo"}</p>
                </div>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-slate-500" aria-hidden />
                  Permiso
                </div>
                <p className="mt-2 text-sm text-slate-600">{invite.data.invite.permission}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="size-4 text-slate-500" aria-hidden />
                  Expira
                </div>
                <p className="mt-2 text-sm text-slate-600">{formatDate(invite.data.invite.expiresAt)}</p>
              </div>
            </div>

            {invite.data.session ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold">Sesion</p>
                <p className="mt-1 text-sm text-slate-600">{invite.data.session.title ?? "Sesion colaborativa"} · {invite.data.session.status}</p>
              </div>
            ) : null}

            {needsLogin ? (
              <Link className="btn btn-primary w-full" href={`/login?next=/join/${encodeURIComponent(token)}`}>
                <Lock className="size-4" aria-hidden />
                Iniciar sesion para aceptar
              </Link>
            ) : (
              <button className="btn btn-primary w-full" type="button" onClick={() => accept.mutate()} disabled={accept.isPending || auth.loading}>
                {accept.isPending ? "Aceptando..." : "Aceptar invitacion"}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}

            {accept.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(accept.error)}</p> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
