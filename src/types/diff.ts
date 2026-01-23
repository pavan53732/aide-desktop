export interface DiffContent {
  original: string;
  modified: string;
  diff: string;
}

export interface DiffState {
  diffContent: string | null;
  isApplying: boolean;
  error: string | null;
}

export interface DiffActions {
  setDiffContent: (content: string | null) => void;
  applyDiff: (filePath: string, diff: string) => Promise<void>;
  clearDiff: () => void;
}
