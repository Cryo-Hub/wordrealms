import { create } from 'zustand';

type GameUiState = {
  previewWord: string;
  setPreviewWord: (w: string) => void;
};

export const useGameUiStore = create<GameUiState>((set) => ({
  previewWord: '',
  setPreviewWord: (previewWord) => set({ previewWord }),
}));
