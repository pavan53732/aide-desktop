import { create } from "zustand";

interface PendingDiff {
  filePath: string;
  originalContent: string;
  newContent: string;
}

interface DiffStore {
  isOpen: boolean;
  pendingDiff: PendingDiff | null;

  openDiff: (diff: PendingDiff) => void;
  closeDiff: () => void;
}

export const useDiffStore = create<DiffStore>((set) => ({
  isOpen: false,
  pendingDiff: null,

  openDiff: (diff) => set({ isOpen: true, pendingDiff: diff }),
  closeDiff: () => set({ isOpen: false, pendingDiff: null }),
}));
