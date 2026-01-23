import { create } from "zustand";
import { AIService } from "@/services/ai-service";
import { useProviderStore } from "./provider-store";
import { dbPromise } from "@/lib/db";
import { messages as fsMessages, conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { invoke } from "@tauri-apps/api/core";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  activeConversationId: string | null;
  abortController: AbortController | null;
  error: string | null;

  loadConversation: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<string>;
  addMessage: (role: "user" | "assistant" | "system", content: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  activeConversationId: null,
  abortController: null,
  error: null,

  loadConversation: async (id) => {
    set({ isLoading: true, activeConversationId: id });
    try {
        const db = await dbPromise;
        const rows = await db.select().from(fsMessages).where(eq(fsMessages.conversationId, id)).orderBy(fsMessages.createdAt);
        set({ messages: rows.map(r => ({ id: r.id, role: r.role as any, content: r.content })) });
    } catch (e) {
        console.error("Failed to load conversation", e);
    } finally {
        set({ isLoading: false });
    }
  },

  createConversation: async (title = "New Chat") => {
      const db = await dbPromise;
      const id = crypto.randomUUID();
      const { activeProvider } = useProviderStore.getState();
      await db.insert(conversations).values({
          id,
          title,
          providerId: activeProvider?.id || "unknown",
          createdAt: new Date(),
          updatedAt: new Date(),
      });
      set({ activeConversationId: id, messages: [] });
      return id;
  },

  addMessage: async (role, content) => {
    let { activeConversationId } = get();
    if (!activeConversationId) {
        activeConversationId = await get().createConversation();
    }
    const db = await dbPromise;
    const id = crypto.randomUUID();
    const msg = { id, role, content };
    
    // Optimistic update
    set((state) => ({ messages: [...state.messages, msg] }));

    await db.insert(fsMessages).values({
        id,
        conversationId: activeConversationId!,
        role,
        content,
        createdAt: new Date(),
    });
  },

  sendMessage: async (content) => {
    const { activeProvider, activeModel } = useProviderStore.getState();
    if (!activeProvider) {
        set({ error: "No active provider selected" });
        return;
    }

    let { activeConversationId } = get();
    if (!activeConversationId) {
        activeConversationId = await get().createConversation(content.slice(0, 30));
    }

    // 1. Add User Message (Persisted)
    await get().addMessage("user", content);
    set({ isLoading: true, error: null });

    // 2. Prepare Assistant Message Placeholder
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "" };
    set((state) => ({ messages: [...state.messages, assistantMsg] }));

    // 3. Setup AbortController
    const abortController = new AbortController();
    set({ abortController });

    try {
      // 4. Stream
      let history = get().messages.filter(m => m.id !== assistantId).map(m => ({ role: m.role, content: m.content }));
      
      const modelToUse = activeModel || activeProvider.selectedModel || "default";

      // --- RAG INTEGRATION ---
      try {
          set({ isLoading: true }); // Ensure loading state (though already true)
          // 4a. Generate Embedding for User Query
          // We use the last user message content
          const queryResults = await AIService.getEmbedding(activeProvider, content);
          
          // 4b. Search Context via Rust
          const searchResults = await invoke<any[]>("search_context", { 
              queryEmbedding: queryResults, 
              limit: 5 
          });

          if (searchResults && searchResults.length > 0) {
              console.log("RAG Results:", searchResults);
              // 4c. Inject Context
              // We'll append it to the system message or create a temporary system context.
              // If there is no system message, we prepend one.
              // If there is, we append to it.
              
              const contextBlock = `\n\nRelevant Code Context:\n${searchResults.map(r => `File: ${r.file_path}\n\`\`\`\n${r.content}\n\`\`\``).join("\n\n")}\n\nAnswer the user's question based on this context if relevant.`;
              
              // Check if first message is system
              if (history.length > 0 && history[0].role === "system") {
                  history[0].content += contextBlock;
              } else {
                  history.unshift({ role: "system", content: "You are an intelligent coding assistant." + contextBlock });
              }
          }
      } catch (e) {
          console.warn("RAG Search failed, proceeding without context", e);
      }
      // -----------------------

      let fullContent = "";

      await AIService.streamChat(
        activeProvider,
        history,
        modelToUse,
        (token) => {
          fullContent += token;
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent } : m
            ),
          }));
        },
        abortController.signal
      );

      // 5. Persist Assistant Message
      const db = await dbPromise;
      await db.insert(fsMessages).values({
        id: assistantId,
        conversationId: activeConversationId!,
        role: "assistant",
        content: fullContent,
        createdAt: new Date(),
      });

    } catch (err: any) {
        if (err.name !== "AbortError") {
             set({ error: err.message || "Failed to generate response" });
             // Update UI with error
             set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + "\n[Error: " + err.message + "]" } : m // Don't persist error state?
                ),
              }));
        }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  stopGeneration: () => {
    get().abortController?.abort();
  },

  clearChat: async () => {
    // For now just create new conversation
    await get().createConversation();
  },
}));
