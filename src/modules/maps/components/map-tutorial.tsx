"use client";

import { useEffect, useState } from "react";
import { Bot, MousePointer2, Share2, Sparkles, X } from "lucide-react";

const storageKey = "mindmap-live:tutorial-completed";

export function MapTutorial() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOpen(window.localStorage.getItem(storageKey) !== "true"));
  }, []);

  const finish = () => {
    window.localStorage.setItem(storageKey, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Tutorial de MindMap Live">
      <section className="panel w-full max-w-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-700">Guia rapida</p>
            <h2 className="mt-1 text-2xl font-semibold">Tu primer mapa en menos de un minuto</h2>
          </div>
          <button className="btn btn-ghost size-10 p-0" type="button" onClick={finish} aria-label="Cerrar tutorial">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Step icon={MousePointer2} title="Crea y edita" text="Usa + para agregar nodos. Haz doble clic en su texto para editarlo y arrastralos para ordenar." />
          <Step icon={Share2} title="Colabora" text="Abre Sesiones, crea una clase y comparte su enlace o codigo con tus estudiantes." />
          <Step icon={Bot} title="Usa IA con control" text="Selecciona un nodo, solicita ideas y decide cuales agregar o descartar." />
          <Step icon={Sparkles} title="Guarda versiones" text="Crea snapshots y restaura una version anterior desde el historial." />
        </div>
        <button className="btn btn-primary mt-6 w-full" type="button" onClick={finish}>
          Entendido, abrir el canvas
        </button>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MousePointer2;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-md border border-slate-200 p-3">
      <Icon className="size-5 text-teal-700" aria-hidden />
      <h3 className="mt-2 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </article>
  );
}
