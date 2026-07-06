import { GitBranchPlus, LayoutGrid, Pencil, Plus, Save, Trash2, Undo2 } from "lucide-react";
import { useUiStore } from "@/src/shared/store/ui-store";
import { cn } from "@/src/shared/lib/cn";

export function CanvasToolbar({
  canEdit,
  canSnapshot,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onUndo,
  onAutoLayout,
  onSnapshot,
}: {
  canEdit: boolean;
  canSnapshot: boolean;
  onAddNode: () => void;
  onEditNode: () => void;
  onDeleteNode: () => void;
  onUndo: () => void;
  onAutoLayout: () => void;
  onSnapshot: () => void;
}) {
  const connectMode = useUiStore((state) => state.connectMode);
  const setConnectMode = useUiStore((state) => state.setConnectMode);

  return (
    <aside className="flex w-full shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white p-2 lg:w-16 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
      <button className="btn btn-secondary size-11 shrink-0 p-0" type="button" onClick={onAddNode} disabled={!canEdit} aria-label="Agregar nodo" title="Agregar nodo">
        <Plus className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 shrink-0 p-0" type="button" onClick={onEditNode} disabled={!canEdit} aria-label="Editar nodo seleccionado" title="Editar nodo seleccionado">
        <Pencil className="size-4" aria-hidden />
      </button>
      <button
        className={cn("btn size-11 shrink-0 p-0", connectMode ? "btn-primary" : "btn-secondary")}
        type="button"
        onClick={() => setConnectMode(!connectMode)}
        disabled={!canEdit}
        aria-label={connectMode ? "Salir del modo conectar" : "Activar modo conectar"}
        title={connectMode ? "Salir del modo conectar" : "Conectar nodos"}
      >
        <GitBranchPlus className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 shrink-0 p-0" type="button" onClick={onAutoLayout} disabled={!canEdit} aria-label="Organizar nodos" title="Organizar nodos">
        <LayoutGrid className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 shrink-0 p-0" type="button" onClick={onUndo} disabled={!canEdit} aria-label="Deshacer" title="Deshacer">
        <Undo2 className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 shrink-0 p-0" type="button" onClick={onSnapshot} disabled={!canSnapshot} aria-label="Crear snapshot" title="Crear snapshot">
        <Save className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 shrink-0 p-0 text-red-700" type="button" onClick={onDeleteNode} disabled={!canEdit} aria-label="Eliminar nodo" title="Eliminar nodo">
        <Trash2 className="size-4" aria-hidden />
      </button>
    </aside>
  );
}
