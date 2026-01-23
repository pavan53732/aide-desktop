# AIDE - AI Desktop Editor

<p align="center">
  <strong>Your configurable AI bridge to local files</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-yellow" alt="Status">
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

- **🤖 Multi-Provider AI Hub**: Connect and configure 43 AI providers (31 provider templates: 29 cloud + 2 local + 12 CLI agents) in one interface
- **🔒 Secure File Operations**: Read and edit files with mandatory user confirmation
- **💾 Local-First & Private**: Your API keys and file data stay on your machine
- **🛠️ Developer-Friendly**: Works with your existing projects and workflows
- **🏝️ Workspace Sandboxing**: Strict file access limited to user-selected directories

## 🛠️ Tech Stack

| Component             | Technology                                                                                 | Why Chosen                                      |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Desktop Framework** | [Tauri 2.5](https://v2.tauri.app/)                                                         | Small, fast, secure desktop apps                |
| **AI HTTP Client**    | Custom fetch/streaming implementation                                                        | Lightweight, provider-agnostic, supports streaming |
| **Frontend UI**       | React 19 + TypeScript 5.5 + Tailwind CSS 4.0                                               | Modern, type-safe UI with utility-first styling |
| **UI Components**     | [shadcn/ui](https://ui.shadcn.com/)                                                        | Accessible, customizable components             |
| **State Management**  | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query) | Lightweight state + robust server-state caching |
| **Local Database**    | [Turso](https://turso.tech/) (via [Drizzle ORM](https://orm.drizzle.team/))                | Edge SQLite with type-safe ORM                  |
| **Code Editor**       | [Monaco Editor](https://microsoft.github.io/monaco-editor/)                                | VS Code-grade editing for diff viewer           |
| **Dev Tools**         | Vite 6 + Biome 2.0 + Vitest 2 + Playwright 2                                               | Fast builds, linting/formatting, testing        |

> **CLI Agents:** AIDE also supports 12 CLI-based AI tools (Aider, Copilot CLI, etc.). See [`PROVIDERS.md` CLI Agents section](./PROVIDERS.md#cli-agents-integration) for details.

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

See `PROVIDERS.md` for complete setup details for 30+ AI services.

## 🎯 Usage Examples

```plaintext
User: "Read the main.py file in my project and suggest improvements"
AIDE: [Reads file, analyzes with AI, provides suggestions]

User: "Add error handling to the calculate() function"
AIDE: [Shows diff of proposed changes → User Accepts/Rejects → Applies edits]

User: "Explain how this function works"
AIDE: [Analyzes code and provides detailed explanation]

User: "Create a new file called utils.js with helper functions"
AIDE: [Creates file proposal → User reviews → Accepts/Rejects]
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
│   │   ├── ai/              # AI HTTP client setup
│   │   ├── db/              # Drizzle ORM schema & queries
│   │   ├── cli/             # CLI agent execution
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
| **No Telemetry**         | Zero data collection - app only communicates with user-configured AI providers\*                |
| **No Hardcoded Secrets** | No API keys, endpoints, or model names hardcoded in source                                      |

> \*Exception: OpenRouter requires `extraHeaders` for rankings. This is the only allowed exception.

## 📈 Development Roadmap

### Completed Features (Version 1.0.0)

- ✅ Basic Tauri desktop window with React UI
- ✅ Multi-provider AI configuration (43 providers: 31 provider templates + 12 CLI agents)
- ✅ Dynamic model fetching from provider API
- ✅ Model selection dropdown
- ✅ Workspace folder selection
- ✅ File read operations
- ✅ File edit with diff view + Accept/Reject
- ✅ API keys stored in OS keychain
- ✅ Multi-provider switching
- ✅ File tree sidebar
- ✅ CLI agent execution (Aider, Copilot CLI, etc.)

## 📚 Documentation

| Document                                             | Description                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`README.md`](./README.md)                           | This file - quick start and overview                                                     |
| [`SPECIFICATIONS.md`](./SPECIFICATIONS.md)           | Complete technical specification, architecture, feature set                              |
| [`PROVIDERS.md`](./PROVIDERS.md)                     | AI provider configurations: 31 templates (29 cloud + 2 local) + 12 CLI agents = 43 total |
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
