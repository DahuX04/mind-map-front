import { api } from "@/src/shared/api/http-client";
import type { AiQuestionResponse, AiSuggestionsResponse } from "../types/ai.types";

export function requestSuggestions(mapId: string, input: { selectedNodeId?: string; intent?: string; maxSuggestions?: number; prompt?: string; rootTopic?: string }) {
  return api.post<AiSuggestionsResponse>(`/maps/${mapId}/ai/suggestions`, input);
}

export function askAiQuestion(mapId: string, input: { conversationId?: string; question: string; selectedNodeId?: string; rootTopic?: string }) {
  return api.post<AiQuestionResponse>(`/maps/${mapId}/ai/questions`, input);
}
