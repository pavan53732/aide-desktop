import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { dbPromise } from "@/lib/db";
import { fileEmbeddings } from "@/lib/db/schema";
import { useProviderStore } from "@/stores/provider-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AIService } from "@/services/ai-service";
import { eq } from "drizzle-orm";

interface RAGStore {
  isIndexing: boolean;
  progress: { current: number; total: number; filename: string } | null;
  indexWorkspace: () => Promise<void>;
}

export const useRAGStore = create<RAGStore>((set, get) => ({
  isIndexing: false,
  progress: null,

  indexWorkspace: async () => {
    const { workspacePath, files } = useWorkspaceStore.getState();
    const { activeProvider } = useProviderStore.getState();
    
    if (!workspacePath || !activeProvider) {
      console.error("Cannot index: No workspace or provider");
      return;
    }

    set({ isIndexing: true, progress: { current: 0, total: 0, filename: "Starting..." } });

    try {
      // 1. Get all file paths (flatten tree)
      const allFiles: string[] = [];
      const collectFiles = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.is_dir && node.children) {
            collectFiles(node.children);
          } else if (!node.is_dir) {
            // Filter extensions (Basic)
            if (/\.(ts|tsx|js|jsx|rs|md|txt|json|css|html)$/.test(node.name)) {
                allFiles.push(node.path);
            }
          }
        }
      };
      collectFiles(files);

      set({ progress: { current: 0, total: allFiles.length, filename: "Scanning..." } });

      const db = await dbPromise;

      // 2. Process files
      let processed = 0;
      for (const filePath of allFiles) {
        set({ progress: { current: processed, total: allFiles.length, filename: filePath } });
        
        // Skip if already indexed and not modified? 
        // For MVP, simplistic check: just overwrite or simplistic upsert
        // Ideally checking 'updatedAt' vs file mtime.
        // Let's just re-index for now.

        try {
            const content = await invoke<string>("read_file", { path: filePath });
            
            // Chunking (Naive: 1000 chars)
            // Really should split by paragraph or logic.
            const chunks = content.match(/[\s\S]{1,2000}/g) || [];
            
            // Delete old embeddings for this file
            await db.delete(fileEmbeddings).where(eq(fileEmbeddings.filePath, filePath));

            let chunkIndex = 0;
            for (const chunk of chunks) {
                if (chunk.trim().length < 50) continue; // Skip noise

                const embedding = await AIService.getEmbedding(activeProvider, chunk);
                
                await db.insert(fileEmbeddings).values({
                    id: crypto.randomUUID(),
                    filePath: filePath,
                    content: chunk,
                    embedding: JSON.stringify(embedding),
                    chunkIndex: chunkIndex++,
                    updatedAt: new Date()
                });
            }

        } catch (e) {
            console.error(`Failed to index ${filePath}`, e);
        }

        processed++;
      }

    } catch (err) {
      console.error("Indexing failed", err);
    } finally {
      set({ isIndexing: false, progress: null });
    }
  }
}));
