"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Lock, Map, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { MapEditorPage } from "@/src/modules/maps";
import { ApiError, getErrorMessage } from "@/src/shared/api/api-error";
import { useAuth } from "@/src/shared/auth/use-auth";
import { formatDate } from "@/src/shared/lib/date";
import {
  acceptInvite,
  joinInviteAsGuest,
  requestGuestCollaborationToken,
  resolveInvite,
} from "../api/sessions.client";
import type { GuestAccess } from "../types/session.types";

export function JoinInvitePage({ token }: { token: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [guestAccess, setGuestAccess] = useState<GuestAccess>();
  const [restoringGuest, setRestoringGuest] = useState(true);
  const [restoreError, setRestoreError] = useState<unknown>();
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const stored = readGuestAccess(token);

    if (!stored) {
      queueMicrotask(() => {
        if (active) setRestoringGuest(false);
      });
      return;
    }

    requestGuestCollaborationToken(stored.accessToken)
      .then((collaboration) => {
        if (!active) return;
        const restored = {
          ...stored,
          permission: collaboration.permission,
          collaboration,
        };
        setGuestAccess(restored);
        storeGuestAccess(token, restored);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          removeGuestAccess(token);
        } else {
          setRestoreError(error);
        }
      })
      .finally(() => {
        if (active) setRestoringGuest(false);
      });

    return () => {
      active = false;
    };
  }, [restoreAttempt, token]);

  const invite = useQuery({
    queryKey: ["invites", token, "resolve"],
    queryFn: () => resolveInvite(token),
    enabled: !restoringGuest && !guestAccess && !restoreError,
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () => acceptInvite(token),
    onSuccess: (result) => {
      const sessionId = invite.data?.session?.id;
      router.push(sessionId ? `${result.redirectTo}?sessionId=${encodeURIComponent(sessionId)}` : result.redirectTo);
    },
  });
  const joinAsGuest = useMutation({
    mutationFn: () => joinInviteAsGuest(token, displayName),
    onSuccess: (result) => {
      storeGuestAccess(token, result);
      setGuestAccess(result);
    },
  });

  const submitGuest = (event: FormEvent) => {
    event.preventDefault();
    if (displayName.trim().length >= 2) joinAsGuest.mutate();
  };

  const retryGuestRestore = () => {
    setRestoringGuest(true);
    setRestoreError(undefined);
    setRestoreAttempt((value) => value + 1);
  };

  if (guestAccess) {
    return (
      <MapEditorPage
        mapId={guestAccess.map.id}
        sessionId={guestAccess.session?.id}
        guestAccess={guestAccess}
      />
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--app-bg)] px-4 py-8">
      <section className="panel w-full max-w-3xl p-6">
        <p className="text-sm font-medium text-teal-700">Invitacion colaborativa</p>
        <h1 className="mt-2 text-3xl font-semibold">Unete a MindMap Live</h1>

        {restoringGuest || invite.isLoading ? (
          <p className="mt-6 text-sm text-slate-500">
            {restoringGuest ? "Restaurando tu acceso de invitado..." : "Validando invitacion..."}
          </p>
        ) : null}

        {restoreError ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p className="font-semibold">No pudimos reconectar tu acceso de invitado</p>
            <p className="mt-1 text-sm leading-6">{getErrorMessage(restoreError)}</p>
            <button className="btn btn-secondary mt-4" type="button" onClick={retryGuestRestore}>
              Reintentar
            </button>
          </div>
        ) : null}

        {invite.error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
            <p className="font-semibold">No se pudo abrir la invitacion</p>
            <p className="mt-1 text-sm leading-6">{getErrorMessage(invite.error)}</p>
            <Link className="btn btn-secondary mt-4" href="/">
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
                <p className="mt-2 text-sm text-slate-600">{invite.data.invite.permission === "editor" ? "Puede editar" : "Solo lectura"}</p>
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

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-slate-500" aria-hidden />
                  <h2 className="font-semibold">Entrar con cuenta</h2>
                </div>
                <p className="mt-2 min-h-10 text-sm text-slate-500">El acceso queda asociado a tu perfil y podras volver desde el dashboard.</p>
                {auth.user ? (
                  <button className="btn btn-primary mt-4 w-full" type="button" onClick={() => accept.mutate()} disabled={accept.isPending}>
                    {accept.isPending ? "Aceptando..." : "Aceptar con mi cuenta"}
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                ) : (
                  <Link className="btn btn-primary mt-4 w-full" href={`/login?next=/join/${encodeURIComponent(token)}`}>
                    Iniciar sesion
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </section>

              <form className="rounded-md border border-teal-200 bg-teal-50 p-4" onSubmit={submitGuest}>
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-teal-700" aria-hidden />
                  <h2 className="font-semibold">Entrar como invitado</h2>
                </div>
                <label className="mt-2 block text-sm text-slate-600">
                  Nombre visible
                  <input
                    className="field mt-2"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    required
                  />
                </label>
                <button className="btn btn-secondary mt-4 w-full" type="submit" disabled={joinAsGuest.isPending || displayName.trim().length < 2}>
                  {joinAsGuest.isPending ? "Entrando..." : "Continuar sin cuenta"}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </form>
            </div>

            {accept.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(accept.error)}</p> : null}
            {joinAsGuest.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(joinAsGuest.error)}</p> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

const guestStoragePrefix = "mindmap-live:guest-access:";

function guestStorageKey(token: string) {
  return `${guestStoragePrefix}${token}`;
}

function readGuestAccess(token: string): GuestAccess | undefined {
  try {
    const raw = sessionStorage.getItem(guestStorageKey(token));
    if (!raw) return undefined;
    const access = JSON.parse(raw) as GuestAccess;
    if (!access.accessToken || new Date(access.expiresAt).getTime() <= Date.now()) {
      removeGuestAccess(token);
      return undefined;
    }
    return access;
  } catch {
    removeGuestAccess(token);
    return undefined;
  }
}

function storeGuestAccess(token: string, access: GuestAccess) {
  const stored = {
    ...access,
    collaboration: {
      ...access.collaboration,
      token: undefined,
    },
  };
  try {
    sessionStorage.setItem(guestStorageKey(token), JSON.stringify(stored));
  } catch {
    // El acceso sigue funcionando en memoria si el navegador bloquea el storage.
  }
}

function removeGuestAccess(token: string) {
  try {
    sessionStorage.removeItem(guestStorageKey(token));
  } catch {
    // No hay nada mas que limpiar si el navegador bloquea el storage.
  }
}
