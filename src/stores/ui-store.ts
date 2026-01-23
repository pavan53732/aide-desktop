import { create } from "zustand";

interface UIStore {
  settingsOpen: boolean;
  terminalOpen: boolean;
  commandPaletteOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  terminalOpen: false,
  commandPaletteOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
