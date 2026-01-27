---# AIDE - AI Desktop Editor

> Document Status: Living Specification  
> Stability Tier: Stable  
> Last Updated: 2026-01-25  
> Governing Document: SPECIFICATIONS.md

<p align="center">
  <strong>Your configurable AI bridge to local files</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Living_Specification-blue" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Windows-green" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## ⚠️ For Developers & AI Agents

> **Before implementing, read these documents in order:**
>
> 1. [`SPECIFICATIONS.md`](./SPECIFICATIONS.md) - Architecture, tech stack, MVP scope
> 2. [`PROVIDERS.md`](./PROVIDERS.md) - AI provider configurations (models are fetched dynamically, NEVER hardcoded)
> 3. [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) - UI components, design system
> 4. [`INTELLIGENCE.md`](./INTELLIGENCE.md) - Advanced AI intelligence features (context awareness, learning, multi-model)
>
> **Key Rule:** Models are fetched from provider APIs at runtime. `selectedModel` starts as `null`. Never hardcode model names.

---

## Governance & Authority

This README is a **Stable, user-facing charter** governed by `SPECIFICATIONS.md`.

Rules:
1. This document MUST NOT define architecture, command contracts, or provider behavior.
2. Technical authority resides in:
   - `SPECIFICATIONS.md` (system law)
   - `PROVIDERS.md` (AI provider law)
   - `UI_UX_SPECIFICATION.md` (interface law)
3. Any change that affects installation, security model, or distribution mechanics
   MUST be reflected in `SPECIFICATIONS.md`.
4. The `Last Updated` field in the header MUST be maintained.

---

## 🚀 Overview

**AIDE** (AI Desktop Editor) is a secure, privacy-focused desktop application that allows you to chat with your choice of AI provider (OpenAI, Anthropic, Google Gemini, OpenRouter, local models, etc.) to directly **read, analyze, and edit files** within a controlled local workspace.

### 📥 Installation for End Users

**To install and use AIDE on Windows (no coding required):**

1. **Download** the installer:
   - Go to [Releases](https://github.com/yourusername/aide-desktop/releases)
   - Download `AIDE_<platform>_<arch>.msi` (5-15 MB)

2. **Install**:
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Click "Install"

3. **Run**:
   - Find AIDE in your Start Menu
   - Double-click to launch
   - Configure your AI provider (OpenAI, Anthropic, etc.)
   - Start chatting with AI about your code!

**System Requirements:**
- Windows 10 or Windows 11 (64-bit)
- 100 MB free disk space
- Internet connection (for AI providers)
- **No programming tools or Node.js required!**

> **AI Development Note**: This README, along with the `SPECIFICATIONS.md`, `PROVIDERS.md`, and `UI_UX_SPECIFICATION.md` files, serves as the complete blueprint for AI-assisted development. Copy sections into your AI full-stack builder (Replit Agent, Cursor, etc.) for implementation.

## ✨ Key Features

- **🤖 Multi-Provider AI Hub**: Connect and configure 44 AI providers (31 provider templates: 29 cloud + 2 local + 13 CLI agents) in one interface
- **🧠 Advanced Intelligence**: Context-aware AI that understands your entire project, learns from your style, and predicts your needs
- **🔒 Secure File Operations**: Read and edit files with mandatory user confirmation
- **💾 Local-First & Private**: Your API keys and file data stay on your machine
- **🛠️ Developer-Friendly**: Works with your existing projects and workflows
- **🏝️ Workspace Sandboxing**: Strict file access limited to user-selected directories
- **🎯 Proactive Assistance**: AI finds issues and suggests improvements before you ask
- **🧠🧠 Multi-Agent Collaboration**: Multiple specialized AIs work together on complex tasks

## 🛠️ Tech Stack

| Component             | Technology                                                                                 | Why Chosen                                      |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Desktop Framework** | [Tauri 2.5](https://v2.tauri.app/)                                                         | Small, fast, secure desktop apps                |
| **AI HTTP Client**    | Custom fetch/streaming implementation                                                        | Lightweight, provider-agnostic, supports streaming |
| **Frontend UI**       | React 19 + TypeScript 5.5 + Tailwind CSS 4.0                                               | Modern, type-safe UI with utility-first styling |
| **UI Components**     | [shadcn/ui](https://ui.shadcn.com/)                                                        | Accessible, customizable components             |
| **State Management**  | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query) | Lightweight state + robust server-state caching |
| **Local Database**    | [Turso](https://turso.tech/) (via [Drizzle ORM](https://orm.drizzle.team/))                | Edge SQLite with type-safe ORM                  |
| **Code Editor**       | [Monaco Editor](https://microsoft.github.io/monaco-editor/)                                | VS Code-grade editing for diff viewer           |
| **Dev Tools**         | Vite 6 + Biome 2.0 + Vitest 2 + Playwright 2                                               | Fast builds, linting/formatting, testing        |

> **CLI Agents:** AIDE also supports 12 CLI-based AI tools (Aider, Copilot CLI, etc.). See [`PROVIDERS.md` CLI Agents section](./PROVIDERS.md#cli-agents-integration) for details.

## 📋 Quick Start

> **👥 For End Users:** If you just want to **use** AIDE (not develop it), skip to [Installation for Users](#-installation-for-end-users) below.

### For Developers

#### Prerequisites

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
pnpm dev          # Start Vite dev server
pnpm tauri dev    # Start Tauri development
pnpm build        # Build for production
pnpm tauri build  # Build production executable (.exe/.msi)
pnpm test         # Run Vitest tests
pnpm test:e2e     # Run Playwright tests
pnpm lint         # Run Biome linter
pnpm format       # Format with Biome
pnpm db:push      # Push database schema
pnpm db:studio    # Open Drizzle Studio
```

## 📦 Building & Distribution

### Build Production Executables

```bash
# Build Windows installer and portable executable
pnpm tauri build

# Output location:
# src-tauri/target/release/bundle/msi/AIDE_<platform>_<arch>.msi (Installer)
# src-tauri/target/release/bundle/nsis/AIDE_<platform>_<arch>-setup.exe (NSIS Installer)
# src-tauri/target/release/AIDE.exe (Portable)
```

### Distribution Files

After building, you get multiple distribution options:

| File | Type | Size | Use Case |
|------|------|------|----------|
| `AIDE_<platform>_<arch>.msi` | Windows Installer | 5-15 MB | Standard installation with shortcuts |
| `AIDE_<platform>_<arch>-setup.exe` | NSIS Installer | 5-15 MB | Custom branded installer |
| `AIDE.exe` | Portable Executable | 5-10 MB | Run without installation (USB, testing) |

### Installing on Other Windows PCs

**For End Users (No Development Tools Required):**

1. **MSI Installer (Recommended):**
   - Download `AIDE_<platform>_<arch>.msi`
   - Double-click to run installer
   - Follow installation wizard
   - App appears in Start Menu

2. **Portable Executable:**
   - Download `AIDE.exe`
   - Double-click to run
   - No installation needed

3. **System Requirements:**
   - Windows 10/11 (64-bit)
   - Edge WebView2 (auto-installs if missing)
   - 100 MB disk space
   - No Node.js, npm, or development tools required

### Distribution & Publishing

```bash
# Create GitHub Release with installers
gh release create <release-tag> \
  src-tauri/target/release/bundle/msi/*.msi \
  src-tauri/target/release/bundle/nsis/*.exe \
  --title "AIDE Release" \
  --notes "Release notes"

# Or manually upload to:
# - GitHub Releases
# - Company file server
# - Download page
```

### Code Signing (Optional but Recommended)

To avoid "Unknown Publisher" warnings:

```json
// tauri.conf.json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

## 🏗️ Why Tauri Over .NET/Electron?

AIDE uses **Tauri 2.5** for superior performance and developer experience:

| Feature | Tauri | .NET (WPF/WinUI) | Electron |
|---------|-------|------------------|----------|
| **App Size** | 5-15 MB | 50-150 MB | 100-200 MB |
| **Memory Usage** | 50-150 MB | 100-300 MB | 300-500 MB |
| **Startup Time** | < 1 second | 2-3 seconds | 3-5 seconds |
| **Windows** | ✅ Windows 10/11 | ❌ Windows only | ✅ All platforms |
| **Performance** | 🚀 Native (Rust) | ⚡ Good (C#) | 🐢 Slow (Chromium) |
| **UI Framework** | React/Vue/Svelte | XAML | Web tech |
| **Hot Reload** | ✅ Yes | ⚠️ Limited | ✅ Yes |

**Key Advantages:**
- ✅ **10x Smaller** - 5 MB vs 150 MB installers
- ✅ **Blazing Fast** - Rust backend rivals C++ performance
- ✅ **Modern Stack** - React + TypeScript + Tailwind CSS
- ✅ **Secure** - Rust prevents memory bugs and data races
- ✅ **Windows-native** - Optimized specifically for Windows 10/11
- ✅ **Native Look** - Uses system WebView (Edge WebView2 on Windows)

### Real-World Deployment Scenarios

**Scenario 1: Enterprise Internal Tool**
```bash
# Build once on CI/CD
pnpm tauri build

# Deploy to company network share
\\company-server\apps\AIDE_<platform>_<arch>.msi

# Employees install via Group Policy or self-service
# No Node.js or dev tools needed on employee machines
```

**Scenario 2: Public Distribution**
```bash
# Build and release
pnpm tauri build
gh release create <release-tag> src-tauri/target/release/bundle/msi/*.msi

# Users download from GitHub/website and install
# Works like any commercial Windows application
```

**Scenario 3: Portable USB Distribution**
```bash
# Build portable executable
pnpm tauri build

# Copy to USB drive
cp src-tauri/target/release/AIDE.exe E:\Tools\

# Run on any Windows PC without installation
# Perfect for contractors, demos, or restricted environments
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

See `PROVIDERS.md` for complete setup details for all supported AI services.

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
├── src/                      # Frontend (React/TypeScript)
│   ├── components/           # UI Components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chat/            # Chat interface components
│   │   ├── diff/            # Diff viewer components
│   │   └── providers/       # Provider selector components
│   ├── lib/
│   │   ├── ai/              # AI HTTP client setup
│   │   ├── db/              # Drizzle ORM schema & queries
│   │   ├── cli/             # CLI agent execution
│   │   └── utils/           # Helper utilities
│   ├── stores/              # Zustand state stores
│   ├── hooks/               # Custom React hooks
│   └── main.tsx             # App entry point
├── src-tauri/               # Backend (Rust)
│   ├── src/
│   │   ├── commands/        # Tauri commands (read_file, write_file)
│   │   └── main.rs
│   └── tauri.conf.json      # Security & permissions
├── tests/                   # Test files
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── SPECIFICATIONS.md        # Complete project blueprint
├── PROVIDERS.md             # AI provider configurations
├── UI_UX_SPECIFICATION.md   # Design & interface specs
└── README.md                # This file
```

## 🔒 Security Model

| Principle                | Implementation                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **File Sandboxing**      | All operations confined to user-selected workspace only                                         |
| **Credential Safety**    | API keys encrypted in Windows Credential Manager                                                 |
| **Explicit Consent**     | All file edits require manual approval via diff view - no auto-apply                            |
| **No Telemetry**         | Zero data collection - app only communicates with user-configured AI providers\*                |
| **No Hardcoded Secrets** | No API keys, endpoints, or model names hardcoded in source                                      |

> \*Exception: OpenRouter requires `extraHeaders` for rankings. This is the only allowed exception.

## ✨ Current Features

- ✅ Multi-provider AI configuration (44 providers: 31 provider templates + 13 CLI agents)
- ✅ Dynamic model fetching from provider API
- ✅ Secure file operations with diff viewer
- ✅ Workspace sandboxing
- ✅ API keys stored in OS keychain
- ✅ CLI agent integration (Aider, Copilot CLI, etc.)
- ✅ Advanced intelligence features
- ✅ Context-aware AI assistance

## 📚 Documentation

| Document                                             | Description                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`README.md`](./README.md)                           | This file - quick start and overview                                                     |
| [`SPECIFICATIONS.md`](./SPECIFICATIONS.md)           | Complete technical specification, architecture, feature set                              |
| [`PROVIDERS.md`](./PROVIDERS.md)                     | AI provider configurations: 31 templates (29 cloud + 2 local) + 13 CLI agents = 44 total |
| [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) | UI components, design system, user flows                                                 |
| [`INTELLIGENCE.md`](./INTELLIGENCE.md)               | Advanced AI intelligence features: context awareness, learning, multi-model routing      |

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
## 🔧 Advanced Configuration

### Environment Variables

```bash
# Optional environment variables for advanced users
AIDE_LOG_LEVEL=debug          # Enable debug logging
AIDE_CACHE_DIR=/custom/path   # Custom cache directory
AIDE_MAX_FILE_SIZE=10MB       # Maximum file size for processing
AIDE_CONCURRENT_REQUESTS=3    # Max simultaneous AI requests
AIDE_OFFLINE_MODE=true        # Force offline mode for testing
```

### Configuration Files

```bash
# User-level configuration
~/.aide/config.json           # Global settings
~/.aide/providers.json        # Provider configurations
~/.aide/keybindings.json      # Custom keyboard shortcuts

# Project-level configuration
.aide/workspace.json          # Workspace-specific settings
.aide/ignore                  # Files to exclude from AI context
.aide/templates/              # Custom code templates
```

### Advanced Usage

```bash
# CLI commands for power users
aide --provider openrouter --model "anthropic/claude-3-5-sonnet" --file src/main.ts
aide --batch-process src/                    # Process entire directory
aide --export-conversation conversation.md   # Export chat history
aide --import-settings settings.json         # Import configuration
aide --health-check                          # System diagnostics
```

## 🚀 Performance Optimization

### System Requirements

| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| **RAM** | 4 GB | 8 GB | 16 GB+ |
| **CPU** | 2 cores | 4 cores | 8 cores+ |
| **Storage** | 1 GB | 5 GB | 10 GB+ |
| **Network** | 1 Mbps | 10 Mbps | 100 Mbps+ |

### Performance Tips

- **Large Projects**: Use `.aide/ignore` to exclude `node_modules`, build artifacts
- **Slow Networks**: Enable caching with `AIDE_CACHE_ENABLED=true`
- **Memory Usage**: Limit concurrent requests with `AIDE_CONCURRENT_REQUESTS=1`
- **Battery Life**: Use local providers (Ollama) when on battery power

## 🔒 Security & Privacy

### Security Checklist

- [ ] API keys stored in OS keychain (never in files)
- [ ] Workspace sandboxing enabled
- [ ] Network traffic encrypted (HTTPS only)
- [ ] No telemetry or data collection
- [ ] Regular security updates enabled
- [ ] Local-first data processing

### Privacy Features

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Local Processing** | Code analysis runs locally | Your code never leaves your machine |
| **Encrypted Storage** | OS keychain for API keys | Military-grade credential protection |
| **No Telemetry** | Zero data collection | Complete privacy |
| **Workspace Isolation** | Sandboxed file access | Protection from unauthorized access |

## 📊 Personal Analytics

### Built-in Metrics

```typescript
// Available metrics for personal productivity tracking
interface PersonalMetrics {
  usage: {
    requestsPerDay: number;
    tokensConsumed: number;
    costEstimate: number;
  };
  
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
  
  productivity: {
    filesModified: number;
    linesGenerated: number;
    timesSaved: number;
    skillsLearned: string[];
  };
}
```

### Personal Insights

- **Daily Coding Stats**: Track your development velocity
- **AI Effectiveness**: See which suggestions help most
- **Learning Progress**: Monitor skill development
- **Cost Tracking**: Keep tabs on API usage costs

---

## 📝 Note on Excluded Features

**AIDE is intentionally designed as a personal AI coding assistant.** We have deliberately **excluded** the following features to maintain focus on individual developer productivity:

### ❌ **Not Included (By Design)**
- **Enterprise/Team Features**: Shared workspaces, team management, organization controls
- **Mobile Applications**: Mobile companion apps, cross-platform mobile support  
- **Compliance Systems**: SOC 2, HIPAA, enterprise audit trails, SSO integration
- **Team Collaboration**: Multi-user workspaces, shared provider pools, team analytics
- **Enterprise Integrations**: CI/CD pipelines, monitoring systems (Prometheus, Grafana), enterprise SSO
- **Advanced UI Features**: Visual code understanding (screenshot analysis), voice coding capabilities
- **Real-time Pair Programming**: AI watching and suggesting as you type in real-time
- **Plugin System**: Third-party extensions, custom plugins, marketplace integrations
- **Advanced Collaboration**: Team features, shared workspaces, multi-user environments

### 🎯 **Our Philosophy**
AIDE focuses on making **individual developers** incredibly productive with AI assistance while maintaining:
- **Privacy**: Your code stays on your machine
- **Simplicity**: No enterprise complexity or overhead
- **Performance**: Optimized for personal workflows
- **Security**: Personal-grade security without enterprise bureaucracy

> **"AIDE is built for developers who want the most advanced AI coding assistance without enterprise complexity."**

If you need enterprise features, consider solutions like GitHub Copilot Enterprise, Cursor Pro, or Replit Teams. AIDE excels at being your personal AI coding companion.

---

**Built with ❤️ for individual developers who want AI superpowers.**