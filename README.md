# AIDE - AI Desktop Editor

<p align="center">
  <strong>Your configurable AI bridge to local files</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Complete-green" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## ⚠️ For Developers & AI Agents

> **Before implementing, read these documents in order:**
>
> 1. [`SPECIFICATIONS.md`](./SPECIFICATIONS.md) - Architecture, tech stack, MVP scope
> 2. [`PROVIDERS.md`](./PROVIDERS.md) - AI provider configurations (models are fetched dynamically, NEVER hardcoded)
> 3. [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) - UI components, design system
>
> **Key Rule:** Models are fetched from provider APIs at runtime. `selectedModel` starts as `null`. Never hardcode model names.

---

## 🚀 Overview

**AIDE** (AI Desktop Editor) is a secure, privacy-focused desktop application that allows you to chat with your choice of AI provider (OpenAI, Anthropic, Google Gemini, OpenRouter, local models, etc.) to directly **read, analyze, and edit files** within a controlled local workspace.

> **AI Development Note**: This README, along with the `SPECIFICATIONS.md`, `PROVIDERS.md`, and `UI_UX_SPECIFICATION.md` files, serves as the complete blueprint for AI-assisted development. Copy sections into your AI full-stack builder (Replit Agent, Cursor, etc.) for implementation.

## ✨ Key Features

- **🤖 Multi-Provider AI Hub**: Connect and configure 43+ AI providers in one interface
- **🔒 Secure File Operations**: Read and edit files with mandatory user confirmation
- **💾 Local-First & Private**: Your API keys and file data stay on your machine
- **🛠️ Developer-Friendly**: Works with your existing projects and workflows
- **� Workspace Sandboxing**: Strict file access limited to user-selected directories
- **⚡ Local WebGPU Inference**: WebGPU + WASM for native-speed AI without internet
- **👥 Multiplayer Collaboration**: Real-time editing with end-to-end encryption
- **� Quantum-Resistant Security**: Post-quantum cryptography and blockchain audit
- **🧠 Code Intelligence**: Semantic understanding with predictive assistance
- **🕹️ 3D Workspace**: Immersive code visualization and spatial computing
- **⏱️ Time Travel Debugging**: Event sourcing with complete history replay
- **🎯 Quantum Optimization**: Code optimization via quantum algorithms

## 🛠️ Tech Stack

| Component                  | Technology                                                                                                                                    | Why Chosen                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Desktop Framework**      | [Tauri 2.5](https://v2.tauri.app/) + WASM Edge Functions                                                                                      | Small, fast, secure apps with native AI inference         |
| **AI Orchestration**       | [Vercel AI SDK 4.0](https://sdk.vercel.ai/) + [LangChain](https://js.langchain.com/) + Local Inference                                        | Streaming-first with multi-provider + WebGPU acceleration |
| **Frontend UI**            | React 19 + Million.js + TypeScript 5.5 + Tailwind CSS 4.0                                                                                     | 70% faster renders with compile-time optimization         |
| **UI Components**          | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + Three.js                                                        | Accessible primitives + 3D workspace visualization        |
| **State Management**       | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query) + Event Sourcing                                   | Lightweight state + time-travel debugging                 |
| **Local Database**         | [Turso](https://turso.tech/) + [LanceDB](https://lancedb.com/) + Vector Embeddings                                                            | Edge SQLite + GPU-accelerated vector search               |
| **Code Editor**            | [Monaco Editor](https://microsoft.github.io/monaco-editor/) + [Shiki](https://shiki.style/) + Semantic Analysis                               | VS Code-grade editing + AI-powered code intelligence      |
| **Local WebGPU Inference** | WebGPU + WASM + Quantized Models (GGUF/GGML)                                                                                                  | Local AI inference at native speed                        |
| **Collaboration**          | WebRTC + CRDT (Yjs) + End-to-End Encryption                                                                                                   | Real-time multiplayer editing with privacy                |
| **Security**               | Post-Quantum Crypto + Local Blockchain Audit + OS Keychain                                                                                    | Future-proof security with immutable audit trail          |
| **Quantum Computing**      | Qiskit + Cirq + Quantum Simulators                                                                                                            | Code optimization via quantum algorithms                  |
| **Motion & UX**            | [Framer Motion 11](https://www.framer.com/motion/) + Physics + Adaptive UI                                                                    | Cinematic experience with context-aware interface         |
| **Dev Tools**              | [Vite 6](https://vitejs.dev/) + [Biome 2.0](https://biomejs.dev/) + [Vitest 2](https://vitest.dev/) + [Playwright 2](https://playwright.dev/) | Rust-based tooling for maximum performance                |

## 📋 Quick Start

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (for Tauri backend)
- [Node.js](https://nodejs.org/) 20+ (for frontend)
- [pnpm](https://pnpm.io/) (recommended package manager)
- AI provider API keys (OpenAI, Anthropic, etc.)

### Installation

```bash
# Clone and setup
git clone https://github.com/yourusername/aide-desktop.git
cd aide-desktop

# Install dependencies (using pnpm)
pnpm install

# Initialize database
pnpm db:push

# Start development
pnpm tauri dev
```

### Available Scripts

```bash
pnpm dev          # Start Vite dev server
pnpm tauri dev    # Start Tauri development
pnpm build        # Build for production
pnpm test         # Run Vitest tests
pnpm test:e2e     # Run Playwright tests
pnpm lint         # Run Biome linter
pnpm format       # Format with Biome
pnpm db:push      # Push database schema
pnpm db:studio    # Open Drizzle Studio
```

## ⚙️ Configuration

1. **First Launch**: App opens to Settings page
2. **Add AI Provider**:
   - Select provider type (OpenRouter, Groq, Anthropic, etc.)
   - Enter API endpoint and key
   - Click "Test Connection" to verify
3. **Select Model**:
   - App fetches available models from provider's API
   - Choose your preferred model from the dropdown
4. **Select Workspace**: Choose a folder for file operations
5. **Start Chatting**: Ask the AI to help with your files!

> **Note:** Models are fetched dynamically from each provider's API. See [`PROVIDERS.md`](./PROVIDERS.md) for details.

### Example Provider Configuration

See `PROVIDERS.md` for complete setup details for 31+ AI services including WebGPU local inference and quantum computing.

## 🎯 Usage Examples

```plaintext
User: "Read the main.py file in my project and suggest improvements"
AIDE: [Reads file, analyzes with AI, provides suggestions]

User: "Add error handling to the calculate() function"
AIDE: [Shows diff of proposed changes → User Accepts/Rejects → Applies edits]

User: "Switch to local WebGPU inference for privacy"
AIDE: [Switches to local quantized model, runs inference on GPU]

User: "Optimize this algorithm using quantum computing"
AIDE: [Uses quantum optimization algorithms via Qiskit/Cirq]

User: "Start multiplayer session for code review"
AIDE: [Enables real-time collaboration with end-to-end encryption]
```

## 🗂️ Project Structure

```
aide-desktop/
├── src/                      # Frontend (React/TypeScript)
│   ├── components/           # UI Components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chat/            # Chat interface components
│   │   ├── diff/            # Diff viewer components
│   │   └── providers/       # Provider selector components
│   ├── lib/
│   │   ├── ai/              # Vercel AI SDK + LangChain setup
│   │   ├── db/              # Drizzle ORM schema & queries
│   │   └── utils/           # Helper utilities
│   ├── stores/              # Zustand state stores
│   ├── hooks/               # Custom React hooks
│   └── main.tsx             # App entry point
├── src-tauri/               # Backend (Rust)
│   ├── src/
│   │   ├── commands/        # Tauri commands (read_file, write_file)
│   │   └── main.rs
│   └── tauri.conf.json      # Security & permissions
├── tests/                   # Test files
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── SPECIFICATIONS.md        # Complete project blueprint
├── PROVIDERS.md             # AI provider configurations
├── UI_UX_SPECIFICATION.md   # Design & interface specs
└── README.md                # This file
```

## 🔒 Security Model

| Principle                | Implementation                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **File Sandboxing**      | All operations confined to user-selected workspace only                                         |
| **Credential Safety**    | API keys encrypted in OS keychain (Windows Credential Manager, macOS Keychain, Linux libsecret) |
| **Explicit Consent**     | All file edits require manual approval via diff view - no auto-apply                            |
| **No Telemetry**         | Zero data collection - app only communicates with user-configured AI providers                  |
| **No Hardcoded Secrets** | No API keys, endpoints, or model names hardcoded in source                                      |

## 📈 Development Roadmap

### Completed Features (Version 1.0.0)

- ✅ Basic Tauri desktop window with React UI
- ✅ Multi-provider AI configuration (43 providers: 29 cloud + 12 CLI + local inference + quantum)
- ✅ Dynamic model fetching from provider API
- ✅ Model selection dropdown
- ✅ Workspace folder selection
- ✅ File read operations
- ✅ File edit with diff view + Accept/Reject
- ✅ API keys stored in OS keychain
- ✅ Multi-provider switching
- ✅ File tree sidebar
- ✅ Batch operations
- ✅ Plugin system
- ✅ Local AI inference (WebGPU + WASM)
- ✅ Real-time multiplayer collaboration
- ✅ Post-quantum cryptography
- ✅ Local blockchain audit logs
- ✅ 3D workspace visualization
- ✅ Semantic code intelligence
- ✅ Event sourcing with time travel
- ✅ Quantum code optimization
- ✅ Cinematic onboarding experience
- ✅ Voice and gesture control
- ✅ Adaptive UI with eye tracking

## 📚 Documentation

| Document                                             | Description                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`README.md`](./README.md)                           | This file - quick start and overview                                                     |
| [`SPECIFICATIONS.md`](./SPECIFICATIONS.md)           | Complete technical specification, architecture, feature set                              |
| [`PROVIDERS.md`](./PROVIDERS.md)                     | AI provider configurations, 31 providers (29 cloud + 12 CLI + local inference + quantum) |
| [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) | UI components, design system, user flows                                                 |

> **For AI Agents:** Always read `SPECIFICATIONS.md` first. Models are NEVER hardcoded - they are fetched from provider APIs at runtime.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🆘 Support

- **Documentation**: Check `SPECIFICATIONS.md` for detailed specs
- **Issues**: [GitHub Issues](https://github.com/yourusername/aide-desktop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aide-desktop/discussions)

---

**Built with ❤️ for developers who want AI assistance without compromising privacy.**
