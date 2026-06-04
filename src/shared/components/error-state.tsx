import { AlertTriangle } from "lucide-react";
import { getErrorMessage } from "@/src/shared/api/api-error";

export function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="panel flex items-start gap-3 border-red-200 bg-red-50 p-4 text-red-900">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">No se pudo cargar la informacion</p>
        <p className="mt-1 text-sm leading-6">{getErrorMessage(error)}</p>
      </div>
    </div>
  );
}
