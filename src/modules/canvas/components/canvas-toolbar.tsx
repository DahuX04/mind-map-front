import { GitBranchPlus, LayoutGrid, Plus, Save, Trash2, Undo2 } from "lucide-react";
import { useUiStore } from "@/src/shared/store/ui-store";

export function CanvasToolbar({
  canEdit,
  canSnapshot,
  onAddNode,
  onDeleteNode,
  onUndo,
  onAutoLayout,
  onSnapshot,
}: {
  canEdit: boolean;
  canSnapshot: boolean;
  onAddNode: () => void;
  onDeleteNode: () => void;
  onUndo: () => void;
  onAutoLayout: () => void;
  onSnapshot: () => void;
}) {
  const connectMode = useUiStore((state) => state.connectMode);
  const setConnectMode = useUiStore((state) => state.setConnectMode);

  return (
    <aside className="flex w-full gap-2 border-b border-slate-200 bg-white p-2 lg:w-16 lg:flex-col lg:border-b-0 lg:border-r">
      <button className="btn btn-secondary size-11 p-0" type="button" onClick={onAddNode} disabled={!canEdit} aria-label="Agregar nodo" title="Agregar nodo">
        <Plus className="size-4" aria-hidden />
      </button>
      <button
        className="btn btn-secondary size-11 p-0"
        type="button"
        onClick={() => setConnectMode(!connectMode)}
        disabled={!canEdit}
        aria-label="Modo conectar"
        title="Modo conectar"
      >
        <GitBranchPlus className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 p-0" type="button" onClick={onAutoLayout} disabled={!canEdit} aria-label="Organizar nodos" title="Organizar nodos">
        <LayoutGrid className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 p-0" type="button" onClick={onUndo} disabled={!canEdit} aria-label="Deshacer" title="Deshacer">
        <Undo2 className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 p-0" type="button" onClick={onSnapshot} disabled={!canSnapshot} aria-label="Crear snapshot" title="Crear snapshot">
        <Save className="size-4" aria-hidden />
      </button>
      <button className="btn btn-secondary size-11 p-0 text-red-700" type="button" onClick={onDeleteNode} disabled={!canEdit} aria-label="Eliminar nodo" title="Eliminar nodo">
        <Trash2 className="size-4" aria-hidden />
      </button>
    </aside>
  );
}
