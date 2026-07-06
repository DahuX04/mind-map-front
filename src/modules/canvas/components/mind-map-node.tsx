"use client";

import { memo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Check, Lightbulb, MessageCircleQuestion, Sparkles } from "lucide-react";
import { cn } from "@/src/shared/lib/cn";
import type { MindMapNode } from "../types/canvas.types";

const typeStyles = {
  root: "border-slate-950 bg-white text-slate-950",
  concept: "border-emerald-300 bg-emerald-50 text-emerald-950",
  question: "border-amber-300 bg-amber-50 text-amber-950",
  example: "border-sky-300 bg-sky-50 text-sky-950",
  "ai-suggestion": "border-violet-300 bg-violet-50 text-violet-950 border-dashed",
};

function MindMapNodeComponent({ data, selected }: NodeProps<MindMapNode>) {
  const Icon = data.nodeType === "question" ? MessageCircleQuestion : data.source === "ai" ? Sparkles : Lightbulb;

  return (
    <div
      className={cn(
        "relative min-w-52 max-w-64 rounded-lg border-2 px-4 py-3 shadow-sm transition-[border-color,box-shadow,transform] duration-150",
        typeStyles[data.nodeType],
        selected && "z-10 scale-[1.03] !border-teal-600 ring-4 ring-teal-300 ring-offset-2 ring-offset-[var(--app-bg)] shadow-lg",
      )}
      aria-selected={selected}
    >
      {selected ? (
        <span className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-teal-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Check className="size-3" strokeWidth={3} aria-hidden />
          Seleccionado
        </span>
      ) : null}
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-slate-500 !bg-white" />
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <p className="break-words text-sm font-semibold leading-5">{data.label}</p>
          {data.description ? <p className="mt-1 text-xs leading-5 opacity-75">{data.description}</p> : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-slate-500 !bg-white" />
    </div>
  );
}

export const MindMapNodeView = memo(MindMapNodeComponent);
