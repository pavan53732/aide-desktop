import { create } from "zustand";

interface EditorStore {
  activeFileContent: string | null;
  dirty: boolean;
  
  setFileContent: (content: string | null) => void;
  setDirty: (dirty: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeFileContent: null,
  dirty: false,

  setFileContent: (content) => set({ activeFileContent: content, dirty: false }),
  setDirty: (dirty) => set({ dirty }),
}));
