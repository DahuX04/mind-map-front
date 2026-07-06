"use client";

import { FormEvent, useState } from "react";
import { Trash2, UserPlus, Users } from "lucide-react";
import { getErrorMessage } from "@/src/shared/api/api-error";

export type ManagedMember = {
  userId: string;
  access: string;
  displayName: string;
  email: string;
};

export function MemberManagement({
  title = "Miembros y permisos",
  members,
  accessOptions,
  canManage,
  loading,
  error,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title?: string;
  members: ManagedMember[];
  accessOptions: ReadonlyArray<{ value: string; label: string }>;
  canManage: boolean;
  loading?: boolean;
  error?: unknown;
  onAdd: (userId: string, access: string) => Promise<unknown>;
  onUpdate: (userId: string, access: string) => Promise<unknown>;
  onRemove: (userId: string) => Promise<unknown>;
}) {
  const [userId, setUserId] = useState("");
  const [access, setAccess] = useState(accessOptions[0]?.value ?? "");
  const [actionError, setActionError] = useState<unknown>();
  const [pending, setPending] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setActionError(undefined);
    try {
      await action();
    } catch (nextError) {
      setActionError(nextError);
    } finally {
      setPending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const target = userId.trim();
    if (!target) return;
    void run(async () => {
      await onAdd(target, access);
      setUserId("");
    });
  };

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Users className="size-5 text-teal-700" aria-hidden />
          {title}
        </h2>
        <span className="text-xs text-slate-500">{members.length} registrados</span>
      </div>

      {canManage ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_11rem_auto]" onSubmit={submit}>
          <input
            className="field"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="UUID del usuario"
            aria-label="UUID del usuario"
            required
          />
          <select className="field" value={access} onChange={(event) => setAccess(event.target.value)} aria-label="Nivel de acceso">
            {accessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit" disabled={pending}>
            <UserPlus className="size-4" aria-hidden />
            Agregar
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Puedes consultar los miembros, pero solo un responsable puede cambiar permisos.</p>
      )}

      {error || actionError ? (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{getErrorMessage(actionError ?? error)}</p>
      ) : null}

      <div className="mt-4 divide-y divide-slate-100">
        {loading ? <p className="py-4 text-sm text-slate-500">Cargando miembros...</p> : null}
        {!loading && members.length === 0 ? <p className="py-4 text-sm text-slate-500">Todavia no hay miembros directos.</p> : null}
        {members.map((member) => (
          <div key={member.userId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.displayName}</p>
              <p className="truncate text-xs text-slate-500">{member.email}</p>
            </div>
            <select
              className="field sm:w-44"
              value={member.access}
              disabled={!canManage || pending || member.access === "owner"}
              onChange={(event) => void run(() => onUpdate(member.userId, event.target.value))}
              aria-label={`Permiso de ${member.displayName}`}
            >
              {member.access === "owner" ? <option value="owner">Propietario</option> : null}
              {accessOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {canManage && member.access !== "owner" ? (
              <button
                className="btn btn-secondary size-10 p-0 text-red-700"
                type="button"
                onClick={() => void run(() => onRemove(member.userId))}
                disabled={pending}
                aria-label={`Retirar a ${member.displayName}`}
                title="Retirar miembro"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
