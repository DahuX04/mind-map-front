"use client";

import { X } from "lucide-react";
import { MemberManagement } from "@/src/shared/components/member-management";
import { useManageMapMembers, useMapMembers } from "../hooks/use-maps";

export function MapAccessPanel({ mapId, onClose }: { mapId: string; onClose: () => void }) {
  const members = useMapMembers(mapId);
  const manage = useManageMapMembers(mapId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="dialog" aria-modal="true" aria-label="Acceso al mapa">
      <aside className="h-full w-full max-w-xl overflow-auto border-l border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Acceso directo al mapa</h2>
            <p className="mt-1 text-xs text-slate-500">Los permisos de workspace y curso tambien se heredan</p>
          </div>
          <button className="btn btn-ghost size-10 p-0" type="button" onClick={onClose} aria-label="Cerrar">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <MemberManagement
          title="Miembros del mapa"
          members={(members.data ?? []).map((member) => ({
            userId: member.userId,
            access: member.permission,
            displayName: member.user.displayName,
            email: member.user.email,
          }))}
          accessOptions={[
            { value: "editor", label: "Puede editar" },
            { value: "viewer", label: "Solo lectura" },
          ]}
          canManage
          loading={members.isLoading}
          error={members.error}
          onAdd={(userId, permission) => manage.add.mutateAsync({ userId, permission: permission as "editor" | "viewer" })}
          onUpdate={(userId, permission) => manage.update.mutateAsync({ userId, permission: permission as "editor" | "viewer" })}
          onRemove={(userId) => manage.remove.mutateAsync(userId)}
        />
      </aside>
    </div>
  );
}
