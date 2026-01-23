import { create } from "zustand";
import { persist } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";

export interface FileNode {
  path: string;
  name: string;
  kind: "file" | "directory";
  children?: FileNode[];
}

interface WorkspaceStore {
  workspacePath: string | null;
  files: FileNode[];
  selectedFile: string | null;
  isLoading: boolean;
  
  setWorkspacePath: (path: string | null) => void;
  setFiles: (files: FileNode[]) => void;
  setSelectedFile: (path: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  closeWorkspace: () => void;
  refreshFiles: () => Promise<void>;

  // File Ops
  createFile: (path: string, content?: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteNode: (path: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      workspacePath: null,
      files: [],
      selectedFile: null,
      isLoading: false,

      setWorkspacePath: (path) => set({ workspacePath: path }),
      setFiles: (files) => set({ files }),
      setSelectedFile: (path) => set({ selectedFile: path }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      closeWorkspace: () => set({ workspacePath: null, files: [], selectedFile: null }),
      
      refreshFiles: async () => {
          const { workspacePath } = get();
          if (workspacePath) {
             try {
                // Determine which command to use. 
                // Currently we use file_ops::list_files which is recursive but capped.
                const files = await invoke<FileNode[]>("list_files", { path: workspacePath });
                set({ files });
             } catch (e) {
                 console.error("Failed to refresh files", e);
             }
          }
      },

      createFile: async (path, content) => {
          try {
              await invoke("create_file", { path, content });
              await get().refreshFiles();
          } catch (e) {
              console.error("Failed to create file", e);
              throw e;
          }
      },

      createFolder: async (path) => {
          try {
              await invoke("create_directory", { path });
              await get().refreshFiles();
          } catch (e) {
              console.error("Failed to create folder", e);
              throw e;
          }
      },

      deleteNode: async (path) => {
          try {
              await invoke("delete_node", { path });
              await get().refreshFiles();
          } catch (e) {
              console.error("Failed to delete node", e);
              throw e;
          }
      }
    }),
    {
      name: "aide-workspace",
      partialize: (state) => ({ workspacePath: state.workspacePath }), // Only persist the path
    }
  )
);
