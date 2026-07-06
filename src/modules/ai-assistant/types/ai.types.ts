export type AiSuggestion = {
  id: string;
  label: string;
  description?: string;
  reason?: string;
  parentNodeId: string;
};

export type AiSuggestionsResponse = {
  requestId: string;
  suggestions: AiSuggestion[];
  dataProcessingNotice: string;
};

export type AiQuestionResponse = {
  answer: string;
  dataProcessingNotice: string;
};

export type AiSummaryResponse = {
  summary: string;
  nodeCount: number;
  edgeCount: number;
};

export type RequestAiSuggestionsInput = {
  selectedNodeId?: string;
  prompt?: string;
  maxSuggestions?: number;
  rootTopic?: string;
};

export type AskAiQuestionInput = {
  question: string;
  rootTopic?: string;
};
