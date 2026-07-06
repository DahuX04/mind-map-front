import { api } from "@/src/shared/api/http-client";
import type { CanvasStorage } from "@/src/modules/canvas";
import type {
  AiQuestionResponse,
  AiSuggestionsResponse,
  AiSummaryResponse,
  AskAiQuestionInput,
  RequestAiSuggestionsInput,
} from "../types/ai.types";

export function requestSuggestions(mapId: string, input: RequestAiSuggestionsInput) {
  return api.post<AiSuggestionsResponse>(`/maps/${mapId}/ai/suggestions`, input);
}

export function askAiQuestion(mapId: string, input: AskAiQuestionInput) {
  return api.post<AiQuestionResponse>(`/maps/${mapId}/ai/questions`, input);
}

export function decideAiSuggestion(mapId: string, suggestionId: string, decision: "accepted" | "rejected") {
  return api.post(`/maps/${mapId}/ai/suggestions/${suggestionId}/decision`, { decision });
}

export function summarizeMap(mapId: string, canvas: CanvasStorage, rootTopic?: string) {
  return api.post<AiSummaryResponse>(`/maps/${mapId}/ai/summary`, {
    rootTopic,
    nodes: canvas.nodes,
    edges: canvas.edges,
  });
}
