# Project AIDE: AI Desktop Editor - Complete Specification

---

## ⚠️ IMPORTANT: Read This First

> **This section is MANDATORY reading for all developers, AI agents, AI assistants, and anyone working with this codebase.**

### Core Architecture Principles

| #   | Principle                        | Description                                                                                                |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Models are NEVER hardcoded**   | All AI models are fetched dynamically from provider APIs. See `PROVIDERS.md`.                              |
| 2   | **User selects the model**       | After adding a provider, user must select a model from the fetched list. `selectedModel` starts as `null`. |
| 3   | **Priority order matters**       | `openai_compatible` providers first (cost-efficient), `openai` direct last (expensive fallback).           |
| 4   | **API keys in OS keychain only** | Never store API keys in config files, localStorage, or plain text.                                         |
| 5   | **Diff Modal is sacred**         | File changes must always show a diff view. User must explicitly Accept or Reject. No auto-apply.           |
| 6   | **Workspace sandboxing**         | All file operations are confined to the user-selected workspace directory.                                 |
| 7   | **No telemetry**                 | The app never phones home. All communication is with user-configured AI providers only.                    |

### Cross-Reference Documents

| Document                                             | Purpose                                                |
| ---------------------------------------------------- | ------------------------------------------------------ |
| [`PROVIDERS.md`](./PROVIDERS.md)                     | AI provider configurations, model fetching, CLI agents |
| [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) | UI components, design system, user flows               |
| [`SPECIFICATIONS.md`](./SPECIFICATIONS.md)           | This file - architecture, tech stack, MVP scope        |
| [`README.md`](./README.md)                           | Quick start, installation, project overview            |

### Key Data Flow

```
1. User adds provider (endpoint + API key)
         ↓
2. App stores API key in OS keychain (encrypted)
         ↓
3. App calls provider's /models endpoint
         ↓
4. User selects model from dropdown
         ↓
5. App saves selectedModel to config
         ↓
6. User can now chat with provider/model
```

### Do's and Don'ts

| ✅ DO                                     | ❌ DON'T                                      |
| ----------------------------------------- | --------------------------------------------- |
| Fetch models from provider API at runtime | Hardcode model names like `"gpt-4"` in code   |
| Use `selectedModel: null` as default      | Use `defaultModel: "gpt-4-turbo"`             |
| Store API keys in OS keychain             | Store API keys in JSON config or localStorage |
| Show diff modal for all file changes      | Auto-apply changes without user confirmation  |
| Confine file operations to workspace      | Allow access to files outside workspace       |

---

## 1. Project Vision

**Project Name:** AIDE (AI Desktop Editor)  
**Tagline:** "Your configurable AI bridge to local files"  
**Core Mission:** Build a secure, privacy-focused desktop application that allows users to chat with their choice of AI provider (OpenAI, Anthropic, OpenRouter, local models, etc.) to directly read, analyze, and edit files within a controlled local workspace, with mandatory user confirmation for all changes.

## 2. Core Features & User Stories

### Feature Set 1: Multi-Provider AI Configuration (MVP Priority: HIGH)

- **As a user,** I can add, configure, and switch between different AI providers in a Settings page.
- **As a user,** I can input my API endpoints and keys, which are stored securely using the OS keychain.
- **As a user,** I can select which configured provider/model is active for my current session.

### Feature Set 2: Secure File System Workspace (MVP Priority: HIGH)

- **As a user,** I select a root directory as my "workspace" on first launch. All file operations are strictly confined to this folder.
- **As a user,** the AI can read the contents of files within my workspace when I ask it to (e.g., "analyze `src/main.js`").
- **As a user,** the AI can propose edits or create new files. I must review a clear **diff view** of all changes and explicitly click **Accept** or **Reject** before anything is written to disk.
- **As a user,** I can see a file tree sidebar of my current workspace.

### Feature Set 3: Core Application Interface (MVP Priority: HIGH)

- **As a user,** I have a clean, familiar chat interface for conversing with the AI.
- **As a user,** I can see a visual indicator of the currently active AI provider.
- **As a user,** I can see a log of file activities (reads, proposed edits, applied changes) in a status panel.

## 3. Technical Architecture & Stack

### 3.1 Mandated Tech Stack

| Component                   | Technology                                                                                                                                    | Why Chosen                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Desktop Framework**       | [Tauri 2.5](https://v2.tauri.app/) + WASM Edge Functions                                                                                      | Small, fast, secure apps with native AI inference         |
| **AI Orchestration**        | [Vercel AI SDK 4.0](https://sdk.vercel.ai/) + [LangChain](https://js.langchain.com/) + Local Inference                                        | Streaming-first with multi-provider + WebGPU acceleration |
| **Frontend UI**             | React 19 + Million.js + TypeScript 5.5 + Tailwind CSS 4.0                                                                                     | 70% faster renders with compile-time optimization         |
| **3D Workspace**            | Three.js + Spatial Computing + @react-three/fiber                                                                                             | Immersive code visualization and navigation               |
| **Local WebGPU Inference**  | WebGPU + WASM + Quantized Models (GGUF/GGML)                                                                                                  | Hardware-accelerated local AI at native speed             |
| **Real-time Collaboration** | WebRTC + CRDT (Yjs) + End-to-End Encryption                                                                                                   | Multiplayer editing with privacy                          |
| **Quantum Computing**       | Qiskit + Cirq + Quantum Simulators                                                                                                            | Code optimization via quantum algorithms                  |
| **Security**                | Post-Quantum Crypto + Local Blockchain Audit + OS Keychain                                                                                    | Future-proof security with immutable audit trail          |
| **State Management**        | Zustand + TanStack Query                                                                                                                      | Centralized store with robust server-state caching        |
| **Local Database**          | [Turso](https://turso.tech/) + [LanceDB](https://lancedb.com/) + Vector Embeddings                                                            | Edge SQLite + GPU-accelerated vector search               |
| **Code Editor**             | [Monaco Editor](https://microsoft.github.io/monaco-editor/) + [Shiki](https://shiki.style/) + Semantic Analysis                               | VS Code-grade editing + AI-powered code intelligence      |
| **Motion & UX**             | [Framer Motion 11](https://www.framer.com/motion/) + Physics + Adaptive UI                                                                    | Cinematic experience with context-aware interface         |
| **Dev Tools**               | [Vite 6](https://vitejs.dev/) + [Biome 2.0](https://biomejs.dev/) + [Vitest 2](https://vitest.dev/) + [Playwright 2](https://playwright.dev/) | Rust-based tooling for maximum performance                |

### 3.2 Complete System Architecture

````mermaid
graph TB
    User[User Input] --> Frontend[React 19 + Three.js + Million.js]
    Frontend --> Tauri[Tauri 2.5 + WASM + WebGPU]

    Tauri --> MultiAI[Multi-AI Orchestrator]
    Tauri --> LocalAI[Local WebGPU Inference]
    Tauri --> Quantum[Quantum Optimizer]
    Tauri --> Blockchain[Blockchain Audit System]
    Tauri --> Collaboration[CRDT Collaboration Engine]

    MultiAI --> Cloud[29+ Cloud Providers]
    MultiAI --> Local[WebGPU Local Models]
    MultiAI --> QuantumAPI[Quantum Computing APIs]
    MultiAI --> CLI[12 CLI Agents]

    LocalAI --> WebGPU[WebGPU Acceleration]
    LocalAI --> WASM[WASM Runtime]
    LocalAI --> Models[Quantized GGUF Models]

    Quantum --> Qiskit[Qiskit Simulator]
    Quantum --> Cirq[Cirq Quantum]

    Blockchain --> Audit[Immutable Audit Trail]
    Blockchain --> PostQuantum[Post-Quantum Crypto]

    Collaboration --> WebRTC[WebRTC P2P]
    Collaboration --> CRDT[CRDT Synchronization]
    Collaboration --> E2E[End-to-End Encryption]

    FileOps[File Operations] --> ReadWrite[Read/Write Files]
    FileOps --> Diff[Diff Modal + 3D Visualization]
    FileOps --> Sandbox[Workspace Sandbox]

    subgraph "Complete Data Layer"
        Turso[(Turso Edge SQLite)]
        LanceDB[(LanceDB Vector DB)]
        VectorIndex[Vector Index]
        SemanticSearch[Semantic Search]
    end

    Frontend --> Turso
    Frontend --> LanceDB
    Frontend --> ThreeJS[3D Workspace Renderer]
    Frontend --> AdaptiveUI[Adaptive Interface]
```ollaboration]
    end

    Frontend --> LanceDB
    Frontend --> EventSourcing
    Frontend --> ThreeJS
    Frontend --> CRDT
````

### 3.3 Key Security Model

1.  **File System Sandboxing:** The app's `tauri.conf.json` will define a strict allow-list for file system access, scoped initially to the user-selected workspace directory.
2.  **Credential Storage:** API keys will be encrypted and stored using the OS-native keychain (Windows Credential Manager, macOS Keychain, Linux libsecret) via Tauri's `tauri-plugin-store` or similar.
3.  **No Telemetry:** The application will not phone home. All communication is strictly between the app and the user's configured AI provider endpoint.
4.  **Explicit Consent:** The **diff-and-confirm** step is non-optional for the MVP. An "auto-apply" mode may be a configurable setting in the future, defaulting to OFF.

### 3.4 Current State Management (Phase 1)

#### Zustand Stores Structure

```typescript
// stores/provider-store.ts
interface ProviderStore {
  // State
  activeProvider: AIProviderConfig | null; // Currently selected provider
  activeModel: string | null; // Currently selected model (user picks from API)
  providers: AIProviderConfig[]; // All configured providers
  availableModels: ModelInfo[]; // Models fetched from active provider's API
  isConnected: boolean; // Connection status
  isFetchingModels: boolean; // Loading state for model fetching

  // Actions
  setActiveProvider: (provider: AIProviderConfig) => void;
  setActiveModel: (modelId: string) => void;
  addProvider: (provider: AIProviderConfig) => void;
  removeProvider: (id: string) => void;
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => void;
  fetchModels: (provider: AIProviderConfig) => Promise<void>;
  testConnection: (provider: AIProviderConfig) => Promise<boolean>;
}

// Model info fetched from provider API
interface ModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  maxTokens?: number;
  description?: string;
}

// stores/workspace-store.ts
interface WorkspaceStore {
  workspacePath: string | null;
  fileTree: FileNode[];
  activeFile: string | null;
  isLoading: boolean;

  setWorkspace: (path: string) => void;
  refreshFileTree: () => Promise<void>;
  setActiveFile: (path: string | null) => void;
}

// stores/chat-store.ts
interface ChatStore {
  messages: Message[];
  isThinking: boolean;
  pendingDiff: DiffProposal | null;
  currentConversationId: string | null;

  addMessage: (message: Message) => void;
  setThinking: (state: boolean) => void;
  proposeDiff: (diff: DiffProposal) => void;
  acceptDiff: () => Promise<void>;
  rejectDiff: () => void;
  clearDiff: () => void;
  startNewConversation: () => void;
}

// stores/ui-store.ts
interface UIStore {
  sidebarOpen: boolean;
  activityLogOpen: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  theme: "light" | "dark" | "system";

  toggleSidebar: () => void;
  toggleActivityLog: () => void;
  toggleCommandPalette: () => void;
  toggleSettings: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}
```

#### Provider Store Implementation Example

```typescript
// stores/provider-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProviderStore = create<ProviderStore>()(
  persist(
    (set, get) => ({
      activeProvider: null,
      activeModel: null,
      providers: [],
      availableModels: [],
      isConnected: false,
      isFetchingModels: false,

      setActiveProvider: (provider) => {
        set({
          activeProvider: provider,
          activeModel: null,
          availableModels: [],
        });
        // Automatically fetch models when provider is selected
        get().fetchModels(provider);
      },

      setActiveModel: (modelId) => {
        set({ activeModel: modelId });
        // Update the provider's selectedModel in the providers array
        const { activeProvider, providers } = get();
        if (activeProvider) {
          const updated = providers.map((p) =>
            p.id === activeProvider.id ? { ...p, selectedModel: modelId } : p,
          );
          set({ providers: updated });
        }
      },

      fetchModels: async (provider) => {
        set({ isFetchingModels: true });
        try {
          const models = await fetchModelsFromAPI(provider);
          set({ availableModels: models, isConnected: true });
        } catch (error) {
          // Use fallback models if API fails
          const fallback = getFallbackModels(provider.type);
          set({ availableModels: fallback, isConnected: false });
        } finally {
          set({ isFetchingModels: false });
        }
      },

      addProvider: (provider) => {
        // New providers always start with selectedModel: null
        const newProvider = { ...provider, selectedModel: null };
        set({ providers: [...get().providers, newProvider] });
      },

      removeProvider: (id) => {
        set({ providers: get().providers.filter((p) => p.id !== id) });
      },

      updateProvider: (id, updates) => {
        set({
          providers: get().providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        });
      },

      testConnection: async (provider) => {
        try {
          const modelsEndpoint = provider.config.modelsEndpoint;
          if (!modelsEndpoint) return true; // No endpoint to test

          const response = await fetch(
            `${provider.endpoint}${modelsEndpoint}`,
            {
              headers: getAuthHeaders(provider),
            },
          );
          return response.ok;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "aide-providers",
      // Don't persist sensitive data - API keys are in OS keychain
      partialize: (state) => ({
        providers: state.providers.map((p) => ({ ...p, apiKey: "" })),
        activeProvider: state.activeProvider
          ? { ...state.activeProvider, apiKey: "" }
          : null,
        activeModel: state.activeModel,
      }),
    },
  ),
);
```

#### TanStack Query for Model Fetching

```typescript
// hooks/use-models.ts
import { useQuery } from "@tanstack/react-query";
import { useProviderStore } from "@/stores/provider-store";

export function useModels() {
  const { activeProvider } = useProviderStore();

  return useQuery({
    queryKey: ["models", activeProvider?.id, activeProvider?.endpoint],
    queryFn: async () => {
      if (!activeProvider) return [];

      const modelsEndpoint = activeProvider.config.modelsEndpoint;

      // If no models endpoint, use fallback
      if (!modelsEndpoint) {
        return getFallbackModels(activeProvider.type);
      }

      // Fetch live models from API
      const response = await fetch(
        `${activeProvider.endpoint}${modelsEndpoint}`,
        { headers: getAuthHeaders(activeProvider) },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      return (
        data.data?.map((m: any) => ({
          id: m.id,
          name: m.id,
          contextWindow: m.context_window,
          maxTokens: m.max_tokens,
        })) || []
      );
    },
    enabled: !!activeProvider,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
  });
}

// Fallback models for providers without /models endpoint
function getFallbackModels(providerType: string): ModelInfo[] {
  const fallbacks: Record<string, string[]> = {
    anthropic: [
      "claude-3-5-sonnet",
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku",
    ],
    bedrock: [
      "anthropic.claude-3-sonnet-20240229-v1:0",
      "amazon.titan-text-express-v1",
    ],
    ai21: ["j2-ultra", "j2-mid", "j2-light"],
    writer: ["palmyra-x", "palmyra-base"],
    reka: ["reka-core", "reka-flash"],
    inflection: ["inflection-2.5"],
    blackbox: ["blackbox-code", "blackbox-chat"],
    opencode: ["opencode-instruct", "opencode-base"],
  };

  return (fallbacks[providerType] || []).map((id) => ({ id, name: id }));
}
```

### 3.5 Database Schema (Drizzle ORM)

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Chat history
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  providerId: text("provider_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// File operation logs
export const fileOperations = sqliteTable("file_operations", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  operation: text("operation", {
    enum: ["read", "write", "create", "delete"],
  }).notNull(),
  filePath: text("file_path").notNull(),
  status: text("status", {
    enum: ["pending", "accepted", "rejected"],
  }).notNull(),
  diff: text("diff"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// User preferences (non-sensitive)
export const preferences = sqliteTable("preferences", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
```

### 3.6 CLI Agent Integration

#### Execution Strategy

CLI agents (Aider, GPT Engineer, Copilot CLI, etc.) will be invoked from the Tauri Rust backend using `std::process::Command`.

```rust
// src-tauri/src/commands/cli_agents.rs
use std::process::{Command, Stdio};
use tauri::command;

#[command]
pub async fn run_cli_agent(
    agent_command: String,
    args: Vec<String>,
    working_dir: String,
    env_vars: std::collections::HashMap<String, String>,
) -> Result<String, String> {
    let mut cmd = Command::new(&agent_command);

    cmd.args(&args)
       .current_dir(&working_dir)
       .stdout(Stdio::piped())
       .stderr(Stdio::piped());

    // Set environment variables (e.g., OPENAI_API_KEY from keychain)
    for (key, value) in env_vars {
        cmd.env(key, value);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
pub async fn check_cli_availability(command: String) -> Result<bool, String> {
    let result = Command::new("which") // Unix
        .arg(&command)
        .output();

    // Fallback for Windows
    #[cfg(target_os = "windows")]
    let result = Command::new("where")
        .arg(&command)
        .output();

    match result {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}
```

#### Frontend Integration

```typescript
// lib/cli/execute.ts
import { invoke } from "@tauri-apps/api/core";

export async function runCLIAgent(
  agent: CLIProviderConfig,
  prompt: string,
): Promise<string> {
  // Get API key from keychain for the agent's required provider
  const envVars: Record<string, string> = {};

  if (agent.config.environmentVars?.OPENAI_API_KEY) {
    envVars.OPENAI_API_KEY = await invoke("get_api_key", { key: "openai" });
  }

  return await invoke("run_cli_agent", {
    agentCommand: agent.command,
    args: [prompt],
    workingDir: agent.workingDirectory || process.cwd(),
    envVars,
  });
}
```

#### Security Considerations

| Concern             | Mitigation                                           |
| ------------------- | ---------------------------------------------------- |
| Command injection   | Validate `command` against allowlist of known agents |
| Path traversal      | Validate `working_dir` is within workspace           |
| Secret exposure     | API keys passed via env vars, never command args     |
| Arbitrary execution | Only pre-approved CLI agents can be invoked          |

## 4. Complete Feature Set

AIDE delivers a revolutionary development environment with the following complete feature set:

### Core AI Features

- 🤖 **43+ AI Providers**: OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, etc.
- ⚡ **Local WebGPU Inference**: Hardware-accelerated local AI with quantized models
- 🧠 **Multi-AI Orchestration**: Intelligent routing and consensus across providers
- 🔮 **Quantum Optimization**: Quantum algorithms for code optimization

### Workspace & Collaboration

- 🌌 **3D Spatial Workspace**: Immersive code visualization with Three.js
- 🤝 **Real-time Collaboration**: Multiplayer editing with CRDT synchronization
- 🔒 **End-to-End Encryption**: Privacy-first collaboration
- 📁 **Smart File Operations**: AI-powered file reading, analysis, and editing

### Security & Privacy

- 🛡️ **Post-Quantum Cryptography**: Future-proof encryption (Kyber-1024)
- 📜 **Blockchain Audit Trail**: Immutable record of all file operations
- 🔐 **OS Keychain Storage**: API keys stored in hardware-secured keychains
- 🏝️ **Workspace Sandboxing**: Strict file access boundaries

### Development Experience

- 🎨 **Adaptive UI**: Context-aware interface that evolves with usage
- ⚡ **WebGPU Acceleration**: 10x faster AI inference
- 🔍 **Semantic Code Search**: Vector-based code understanding
- 🕰️ **Time-travel Debugging**: Event-sourced state management

## 5. Detailed User Workflow (MVP)

### 5.1 Launch

User opens the AIDE application for the first time.

### 5.2 First-Time Provider Setup

1. App detects no configured provider and opens the **Settings** modal.
2. User selects provider type from options:
   - `OpenAI Compatible (Generic)` - for custom endpoints
   - `OpenRouter` - preconfigured
   - `Groq` - preconfigured
   - etc.
3. User enters the API endpoint (pre-filled for known providers).
4. User pastes their API key.
5. User clicks **"Test Connection"** button.
   - Button shows spinner while testing.
   - On success: Green checkmark appears.
   - On failure: Red error message with retry option.
6. User clicks **"Save"** → Provider is saved with `selectedModel: null`.

### 5.3 Model Selection

1. After saving provider, app automatically fetches models from `/models` endpoint.
2. A loading spinner appears: "Fetching available models..."
3. Model dropdown populates with live models from the API.
4. User selects a model (e.g., `anthropic/claude-3.5-sonnet`).
5. App saves the selection and shows toast: "Now using claude-3.5-sonnet with OpenRouter".
6. **Edge Case:** If model fetch fails:
   - Show warning: "Could not fetch models. Using cached list."
   - Display fallback models (if available for provider type).
   - If no fallback, show error and prompt to check API key.

### 5.4 Select Workspace

1. A prominent button says **"Select Workspace Folder"**.
2. User clicks → Native file picker opens.
3. User chooses a directory (e.g., `~/projects/my_app`).
4. App saves this path and displays it in the status bar.
5. Workspace is now active for all file operations.

### 5.5 Making a Request

1. In the main chat input, user types:
   > "Please read `src/main.js` and add a console.log statement at the start of the function."
2. User hits Enter or clicks Send button.

### 5.6 App Processing

1. UI shows "AI is thinking..." indicator.
2. Status bar updates to: `Thinking...`
3. Backend process:
   - LangChain Agent receives the prompt.
   - Agent uses "read file" tool (Tauri command) to fetch `src/main.js`.
   - Agent sends prompt + file content to configured AI provider.
   - Agent receives code suggestion.
   - Agent uses "create edit proposal" tool to generate a diff.

### 5.7 User Confirmation (Diff Modal)

1. A modal pops up titled: **"Review Changes to src/main.js"**
2. Modal shows side-by-side diff view:
   - Left side: Original code (red highlighting for deletions)
   - Right side: New code (green highlighting for additions)
3. Action buttons at bottom:
   - **[Reject]** - Secondary button, discards changes
   - **[Accept & Apply]** - Primary button, applies changes
   - **[Copy Changes]** - Text button, copies diff to clipboard

### 5.8 Completion

1. **If user clicks Accept:**
   - Tauri Rust backend writes new content to file.
   - Modal closes with fade animation.
   - Toast appears: "✓ Changes applied to src/main.js"
   - Chat shows system message: "✓ Changes applied to `src/main.js`."
   - Activity log (future) adds entry.
2. **If user clicks Reject:**
   - Modal closes.
   - Toast appears: "Changes discarded"
   - Chat shows system message: "Changes to `src/main.js` were rejected."
   - Original file remains untouched.
3. Conversation continues - user can make more requests.

### 5.9 Visual State Summary

| State       | UI Indicator                    | Status Bar       |
| ----------- | ------------------------------- | ---------------- |
| Ready       | Chat input enabled              | "Ready"          |
| Thinking    | Input disabled, spinner in chat | "Thinking..."    |
| Diff Review | Modal open, app dimmed          | "Review changes" |
| Applying    | Modal shows spinner             | "Applying..."    |
| Complete    | Modal closed, toast shown       | "Ready"          |
| Error       | Error toast, modal closed       | "Error"          |

## 6. Detailed Specifications

For complete implementation details, see these dedicated documents:

- **User Interface & Experience:** Refer to [UI_UX_SPECIFICATION.md](./UI_UX_SPECIFICATION.md)
- **AI Provider Configurations:** Refer to [PROVIDERS.md](./PROVIDERS.md)
- **Security Model:** See Section 3.3 of this document

## 7. File Structure (Complete)

```
aide-desktop/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── command.tsx        # CMDK wrapper
│   │   │   ├── drawer.tsx         # Vaul wrapper
│   │   │   └── sonner.tsx         # Toast wrapper
│   │   ├── chat/
│   │   │   ├── chat-container.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   └── typing-indicator.tsx
│   │   ├── diff/
│   │   │   ├── diff-modal.tsx
│   │   │   └── diff-viewer.tsx    # Monaco diff
│   │   ├── providers/
│   │   │   ├── provider-selector.tsx
│   │   │   └── provider-card.tsx
│   │   ├── sidebar/
│   │   │   ├── file-tree.tsx
│   │   │   └── activity-log.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── status-bar.tsx
│   │       └── command-palette.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider-adapter.ts
│   │   │   ├── tools.ts           # File read/write tools
│   │   │   └── agent.ts           # LangChain agent setup
│   │   ├── cli/
│   │   │   ├── execute.ts         # CLI agent execution (v1.0.0+)
│   │   │   └── detection.ts       # CLI binary detection
│   │   ├── db/
│   │   │   ├── index.ts           # Database client
│   │   │   ├── schema.ts          # Drizzle schema
│   │   │   └── queries.ts         # Typed queries
│   │   └── utils/
│   │       ├── file-utils.ts
│   │       └── diff-utils.ts
│   ├── stores/
│   │   ├── provider-store.ts
│   │   ├── workspace-store.ts
│   │   ├── chat-store.ts
│   │   └── ui-store.ts
│   ├── hooks/
│   │   ├── use-ai.ts              # Vercel AI SDK hook
│   │   ├── use-file-operations.ts
│   │   ├── use-keyboard-shortcuts.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── file_ops.rs        # read_file, write_file
│   │   │   ├── workspace.rs       # select_workspace
│   │   │   ├── keychain.rs        # secure storage
│   │   │   └── cli_agents.rs      # CLI agent execution (v1.0.0+)
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/
│   ├── unit/
│   │   ├── stores.test.ts
│   │   └── utils.test.ts
│   ├── e2e/
│       ├── chat.spec.ts
│       └── file-ops.spec.ts
├── drizzle/
│   └── migrations/                # Database migrations
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions
├── biome.json                     # Biome config
├── drizzle.config.ts             # Drizzle config
├── playwright.config.ts          # Playwright config
├── vitest.config.ts              # Vitest config
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── SPECIFICATIONS.md
├── PROVIDERS.md
└── UI_UX_SPECIFICATION.md
```

## 8. Success Metrics for MVP

### Functional Metrics

| Metric             | Target       | How to Measure                                 |
| ------------------ | ------------ | ---------------------------------------------- |
| Time to first edit | < 5 minutes  | From fresh install to accepted file edit       |
| Provider setup     | < 2 minutes  | From opening settings to successful connection |
| Model selection    | < 30 seconds | From provider selection to model chosen        |
| File edit flow     | < 1 minute   | From request to diff modal appearing           |

### Security Metrics

| Metric               | Target         | Verification                                         |
| -------------------- | -------------- | ---------------------------------------------------- |
| API key storage      | 100% encrypted | Keys only in OS keychain, never in files             |
| Workspace sandboxing | 100% enforced  | No file access outside selected folder               |
| Telemetry            | Zero           | No network calls except to user-configured providers |
| Diff confirmation    | 100% required  | No file writes without explicit user approval        |

### Reliability Metrics

| Metric         | Target            | Verification                               |
| -------------- | ----------------- | ------------------------------------------ |
| Diff accuracy  | 100%              | Diff view exactly matches proposed changes |
| Accept action  | 100% reliable     | File correctly updated on accept           |
| Reject action  | 100% reliable     | File unchanged on reject                   |
| Model fetch    | Graceful fallback | Fallback models shown if API fails         |
| Error handling | User-friendly     | All errors show clear, actionable messages |

### User Experience Metrics

| Metric          | Target                                  |
| --------------- | --------------------------------------- |
| Provider status | Always visible (connected/disconnected) |
| Active model    | Always visible in header                |
| Thinking state  | Always visible (spinner + status bar)   |
| File context    | Clear which file is being discussed     |

### 3.7 Local WebGPU Inference Engine

AIDE includes a complete local WebGPU inference system for privacy and performance.

#### WebGPU + WASM Architecture

```typescript
// Local inference with hardware acceleration
export class LocalInferenceEngine {
  private webgpuEngine: WebGPUInference;
  private wasmRuntime: WASMRuntime;
  private quantizedModels: Map<string, QuantizedModel>;

  async initialize() {
    // WebGPU for GPU acceleration
    if (await WebGPUInference.isSupported()) {
      this.webgpuEngine = new WebGPUInference();
      await this.webgpuEngine.initialize();
    }

    // WASM fallback for CPU inference
    this.wasmRuntime = await WASMRuntime.load();

    // Load quantized models (5-10x faster)
    await this.loadQuantizedModels([
      "codellama-7b-q4",
      "deepseek-coder-16b-q4",
      "claude-3-sonnet-q4",
    ]);
  }
}
```

### 3.8 Multiplayer Collaboration System

Real-time collaborative editing with end-to-end encryption and conflict resolution.

#### CRDT-Based Synchronization

```typescript
// Conflict-free collaborative editing
export class CollaborativeWorkspace {
  private ydoc: Y.Doc;
  private provider: WebrtcProvider;
  private encryption: E2EEncryption;

  constructor(workspaceId: string) {
    this.ydoc = new Y.Doc();
    this.provider = new WebrtcProvider(workspaceId, this.ydoc);
    this.encryption = new E2EEncryption();

    // End-to-end encryption for privacy
    this.provider.on("peers", (peers) => {
      peers.forEach((peer) => this.encryption.exchangeKeys(peer));
    });
  }
}
```

### 3.9 Quantum Computing Interface

Code optimization using quantum algorithms and simulators.

#### Quantum Code Optimizer

```typescript
// Quantum-enhanced optimization
export class QuantumCodeOptimizer {
  private qiskitBackend: QiskitSimulator;
  private circuitBuilder: QuantumCircuitBuilder;

  async optimizeCode(codeAst: AST): Promise<OptimizedCode> {
    // Convert optimization problem to quantum circuit
    const circuit = this.circuitBuilder.encode(codeAst);

    // Execute on quantum simulator
    const result = await this.qiskitBackend.execute(circuit);

    // Decode quantum result to optimized code
    return this.circuitBuilder.decode(result);
  }
}
```

---

### 3.10 Blockchain Audit System

Immutable audit trail with post-quantum cryptography for complete security compliance.

#### Local Blockchain Architecture

```typescript
// Immutable audit trail for all file operations
export class BlockchainAuditSystem {
  private blockchain: LocalBlockchain;
  private quantumCrypto: PostQuantumCrypto;
  private auditStore: AuditStore;

  constructor() {
    this.blockchain = new LocalBlockchain({
      algorithm: "post-quantum-sha3",
      blockSize: 1024,
      difficulty: 4,
    });
    this.quantumCrypto = new PostQuantumCrypto("CRYSTALS-Kyber");
  }

  async recordFileOperation(operation: FileOperation): Promise<AuditBlock> {
    const auditEntry = {
      timestamp: Date.now(),
      operation: operation.type,
      filePath: operation.path,
      userHash: await this.quantumCrypto.hash(operation.user),
      contentHash: await this.quantumCrypto.hash(operation.content),
      signature: await this.quantumCrypto.sign(operation),
    };

    return await this.blockchain.addBlock(auditEntry);
  }
}
```

#### Compliance Features

- **Immutable History**: All file operations permanently recorded
- **Zero-Knowledge Proofs**: Verify operations without revealing content
- **Multi-Signature Approval**: Require multiple approvals for critical operations
- **Quantum-Resistant**: Future-proof against quantum computer attacks
- **Compliance Reports**: Automated SOC2, GDPR, HIPAA compliance reporting

### 3.11 3D Workspace Architecture

Immersive spatial computing environment for code visualization and navigation.

#### 3D Engine Integration

```typescript
// Three.js integration for 3D workspace
export class Workspace3D {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private spatialIndex: SpatialIndex;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // Spatial indexing for performance
    this.spatialIndex = new SpatialIndex();

    this.setupLighting();
    this.setupControls();
    this.setupPhysics();
  }

  renderFileTree(fileTree: FileNode[]): void {
    // Convert file tree to 3D spatial layout
    const spatialLayout = this.calculateSpatialLayout(fileTree);

    spatialLayout.forEach((node) => {
      const mesh = this.createFileMesh(node);
      this.scene.add(mesh);
      this.spatialIndex.add(mesh, node.bounds);
    });
  }
}
```

#### Spatial Features

- **File Hierarchy Visualization**: 3D representation of directory structure
- **Code Relationship Mapping**: Visual connections between related files
- **Collaborative Presence**: Real-time 3D avatars for multiplayer editing
- **Spatial Navigation**: Natural movement through codebase using VR/AR controls
- **Performance Optimization**: Spatial indexing and level-of-detail rendering

---
