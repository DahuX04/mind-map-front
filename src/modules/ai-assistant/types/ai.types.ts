export type AiSuggestion = {
  id?: string;
  label: string;
  description?: string;
  reason?: string;
  parentNodeId: string;
};

export type AiSuggestionsResponse = {
  requestId?: string;
  suggestions: AiSuggestion[];
};

export type AiQuestionResponse = {
  conversationId?: string;
  answer: string;
};
