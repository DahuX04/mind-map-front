"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe, useProfile } from "@/src/modules/profiles";
import { getErrorMessage } from "@/src/shared/api/api-error";

export function ProfilePage() {
  const profile = useProfile();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      displayName: displayName || profile.data?.displayName,
      avatarUrl: avatarUrl || profile.data?.avatarUrl || undefined,
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <p className="text-sm font-medium text-teal-700">Perfil</p>
        <h1 className="mt-1 text-3xl font-semibold">{profile.data?.displayName ?? "Mi perfil"}</h1>
        <p className="mt-2 text-sm text-slate-500">{profile.data?.email ?? "Datos basicos del usuario autenticado."}</p>
      </section>

      <form className="panel space-y-4 p-4" onSubmit={submit}>
        <label className="block text-sm font-medium">
          Nombre visible
          <input className="field mt-2" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={profile.data?.displayName ?? "Nombre"} />
        </label>
        <label className="block text-sm font-medium">
          Avatar URL
          <input className="field mt-2" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder={profile.data?.avatarUrl ?? "https://..."} />
        </label>
        {mutation.error ? <p className="text-sm text-red-700">{getErrorMessage(mutation.error)}</p> : null}
        {mutation.isSuccess ? <p className="text-sm text-teal-700">Perfil actualizado.</p> : null}
        <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
          Guardar perfil
        </button>
      </form>
    </div>
  );
}
