import { create } from "zustand";

type UiState = {
  aiPanelOpen: boolean;
  activeAiTab: "suggestions" | "questions";
  connectMode: boolean;
  setAiPanelOpen: (open: boolean) => void;
  setActiveAiTab: (tab: "suggestions" | "questions") => void;
  setConnectMode: (enabled: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  aiPanelOpen: true,
  activeAiTab: "suggestions",
  connectMode: false,
  setAiPanelOpen: (aiPanelOpen) => set({ aiPanelOpen }),
  setActiveAiTab: (activeAiTab) => set({ activeAiTab }),
  setConnectMode: (connectMode) => set({ connectMode }),
}));
