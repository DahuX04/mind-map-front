"use client";

import { useMutation } from "@tanstack/react-query";
import { Bot, Check, MessageSquare, Plus, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getErrorMessage } from "@/src/shared/api/api-error";
import { env } from "@/src/shared/config/env";
import { cn } from "@/src/shared/lib/cn";
import { useUiStore } from "@/src/shared/store/ui-store";
import { askAiQuestion, requestSuggestions } from "../api/ai.client";
import type { AiSuggestion } from "../types/ai.types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AiAssistantPanel({
  mapId,
  selectedNodeId,
  selectedNodeLabel,
  rootTopic,
  canEdit,
  onAcceptSuggestion,
}: {
  mapId: string;
  selectedNodeId?: string;
  selectedNodeLabel?: string;
  rootTopic?: string;
  canEdit: boolean;
  onAcceptSuggestion: (suggestion: AiSuggestion) => void;
}) {
  const activeTab = useUiStore((state) => state.activeAiTab);
  const setActiveTab = useUiStore((state) => state.setActiveAiTab);
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const suggestionsMutation = useMutation({
    mutationFn: () =>
      requestSuggestions(mapId, {
        selectedNodeId,
        intent: "expand-branch",
        maxSuggestions: 4,
        prompt: prompt.trim() || undefined,
        rootTopic,
      }),
    onSuccess: (result) => setSuggestions(result.suggestions),
  });

  const questionMutation = useMutation({
    mutationFn: (value: string) =>
      askAiQuestion(mapId, {
        question: value,
        selectedNodeId,
        rootTopic,
      }),
    onSuccess: (result) => setMessages((current) => [...current, { role: "assistant", content: result.answer }]),
  });

  const sendQuestion = (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    setMessages((current) => [...current, { role: "user", content: value }]);
    setQuestion("");
    questionMutation.mutate(value);
  };

  const accept = (suggestion: AiSuggestion) => {
    onAcceptSuggestion(suggestion);
    setSuggestions((current) => current.filter((item) => item !== suggestion));
  };

  if (!env.enableAi) {
    return (
      <aside className="w-full border-l border-slate-200 bg-white p-4 lg:w-80">
        <p className="text-sm font-semibold">IA desactivada</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Activa NEXT_PUBLIC_ENABLE_AI para usar sugerencias y preguntas.</p>
      </aside>
    );
  }

  return (
    <aside className="flex w-full flex-col border-l border-slate-200 bg-white lg:w-80">
      <div className="flex border-b border-slate-200 p-2">
        <button
          className={cn("btn flex-1", activeTab === "suggestions" ? "btn-primary" : "btn-ghost")}
          type="button"
          onClick={() => setActiveTab("suggestions")}
        >
          <Bot className="size-4" aria-hidden />
          Sugerencias
        </button>
        <button
          className={cn("btn flex-1", activeTab === "questions" ? "btn-primary" : "btn-ghost")}
          type="button"
          onClick={() => setActiveTab("questions")}
        >
          <MessageSquare className="size-4" aria-hidden />
          Preguntas
        </button>
      </div>

      {activeTab === "suggestions" ? (
        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Nodo seleccionado</p>
            <p className="mt-1 text-xs text-slate-500">{selectedNodeLabel ?? selectedNodeId ?? "Se usara el nodo raiz."}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Tema autorizado: {rootTopic ?? "nodo raiz del mapa"}</p>
          </div>
          <textarea
            className="field textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Pide un enfoque: ejemplos, causas, preguntas..."
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => suggestionsMutation.mutate()}
            disabled={suggestionsMutation.isPending}
          >
            <Plus className="size-4" aria-hidden />
            Sugerir nodos
          </button>
          {suggestionsMutation.error ? <p className="text-sm text-red-700">{getErrorMessage(suggestionsMutation.error)}</p> : null}
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.label}-${index}`} className="rounded-md border border-violet-200 bg-violet-50 p-3">
                <p className="text-sm font-semibold text-violet-950">{suggestion.label}</p>
                {suggestion.description ? <p className="mt-1 text-xs leading-5 text-violet-900">{suggestion.description}</p> : null}
                {suggestion.reason ? <p className="mt-2 text-xs leading-5 text-violet-700">Motivo: {suggestion.reason}</p> : null}
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-primary h-9" type="button" onClick={() => accept(suggestion)} disabled={!canEdit}>
                    <Check className="size-4" aria-hidden />
                    Agregar
                  </button>
                  <button className="btn btn-secondary h-9" type="button" onClick={() => setSuggestions((current) => current.filter((item) => item !== suggestion))}>
                    <X className="size-4" aria-hidden />
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={sendQuestion}>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">
                Pregunta solo sobre el tema del canvas: {rootTopic ?? "nodo raiz del mapa"}. El backend rechazara consultas fuera de tema.
              </p>
            ) : null}
            {messages.map((message, index) => (
              <div key={index} className={cn("rounded-md p-3 text-sm leading-6", message.role === "user" ? "bg-slate-100" : "bg-teal-50 text-teal-950")}>
                <MarkdownMessage content={message.content} />
              </div>
            ))}
            {questionMutation.isPending ? <TypingIndicator /> : null}
            {questionMutation.error ? <p className="text-sm text-red-700">{getErrorMessage(questionMutation.error)}</p> : null}
          </div>
          <div className="border-t border-slate-200 p-3">
            <textarea className="field textarea min-h-24" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Escribe una pregunta..." />
            <button className="btn btn-primary mt-2 w-full" type="submit" disabled={questionMutation.isPending}>
              <Send className="size-4" aria-hidden />
              Enviar pregunta
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-3 py-2 text-teal-900">
      <span className="size-1.5 animate-bounce rounded-full bg-teal-700 [animation-delay:-0.2s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-teal-700 [animation-delay:-0.1s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-teal-700" />
      <span className="ml-2 text-xs font-medium">IA escribiendo</span>
    </div>
  );
}
