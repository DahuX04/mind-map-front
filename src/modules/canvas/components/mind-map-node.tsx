"use client";

import { memo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Lightbulb, MessageCircleQuestion, Sparkles } from "lucide-react";
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
        "min-w-52 max-w-64 rounded-lg border-2 px-4 py-3 shadow-sm",
        typeStyles[data.nodeType],
        selected && "ring-4 ring-teal-200",
      )}
    >
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
