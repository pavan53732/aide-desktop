# AIDE - UI/UX Design Specification

---

## ⚠️ IMPORTANT: Read This First

> **This section is MANDATORY reading for all developers, AI agents, AI assistants, and anyone implementing the UI.**

### Core UI Principles

| #   | Principle                                   | Description                                                                                                |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Diff Modal is Sacred**                    | The file diff viewer must NEVER have blur, translucency, or animations. Code review accuracy is paramount. |
| 2   | **Models are fetched dynamically**          | Provider Selector shows models fetched from API at runtime, NOT hardcoded lists. See `PROVIDERS.md`.       |
| 3   | **selectedModel starts as null**            | When displaying provider cards, show "No model selected" if `selectedModel` is `null`.                     |
| 4   | **State must always be visible**            | User must always know: Which provider is active? Which model? Is it thinking? What file?                   |
| 5   | **Keyboard-first design**                   | All actions must be accessible via keyboard shortcuts. See Section 5.4.                                    |
| 6   | **No hardcoded provider/model names in UI** | UI components must read from config, never hardcode "GPT-4" or "Claude" in JSX.                            |
| 7   | **Accessibility is mandatory**              | All components must meet WCAG AA standards. See Section 7.                                                 |

### Provider Selector Behavior

```
1. User clicks Provider Selector
         ↓
2. Dropdown shows list of configured providers
         ↓
3. Each provider card shows:
   - Provider name (from config)
   - Selected model (or "No model selected" if null)
   - Connection status
         ↓
4. User clicks a provider → App fetches models from API
         ↓
5. Model dropdown appears with live models
         ↓
6. User selects model → saved to selectedModel
```

### Do's and Don'ts for UI Implementation

| ✅ DO                                                  | ❌ DON'T                                |
| ------------------------------------------------------ | --------------------------------------- |
| Read provider/model names from config                  | Hardcode `"GPT-4"` or `"Claude"` in JSX |
| Show "No model selected" when `selectedModel === null` | Show empty or undefined text            |
| Fetch models on provider selection                     | Use static model lists in dropdowns     |
| Keep Diff Modal opaque and high-contrast               | Add blur or glassmorphism to code views |
| Respect `prefers-reduced-motion`                       | Force animations on all users           |
| Use semantic color tokens (`--primary`, `--success`)   | Hardcode hex colors in components       |

---

## 1. Design Philosophy & Core Principles

**AIDE should feel like a professional, trustworthy co-pilot for your files.**

- **Clarity Over Cleverness:** Every element must have a clear purpose. Avoid unnecessary decoration.
- **Progressive Disclosure:** Show essential options first. Hide advanced settings (tokens, temperature) behind toggles.
- **State Visibility:** The user must _always_ know: Which AI is active? Is it thinking? What file are we discussing?
- **Trust Through Transparency:** The file diff view is sacred. Changes must be unambiguous before approval.
- **Keyboard-First:** Power users should be able to navigate and act primarily with shortcuts.

## 2. Visual Language

### 2.1 Color Palette

Define a primary theme (light/dark) with these semantic roles.

| Role                                  | Light Theme             | Dark Theme              | Usage                                     |
| :------------------------------------ | :---------------------- | :---------------------- | :---------------------------------------- |
| **Primary**                           | `#3b82f6` (Blue-600)    | `#60a5fa` (Blue-400)    | Primary buttons, active states, accents.  |
| **Quantum** (`--quantum`)             | `#8b5cf6` (Violet-500)  | `#a78bfa` (Violet-400)  | Quantum computing features, optimization  |
| **WebGPU** (`--webgpu`)               | `#06b6d4` (Cyan-500)    | `#22d3ee` (Cyan-400)    | Local AI inference, hardware acceleration |
| **Collaboration** (`--collaboration`) | `#f59e0b` (Amber-500)   | `#fbbf24` (Amber-400)   | Multiplayer features, real-time editing   |
| **3D Workspace** (`--3d-workspace`)   | `#10b981` (Emerald-500) | `#34d399` (Emerald-400) | 3D visualization, spatial computing       |
| **Background - Primary**              | `#ffffff`               | `#0f172a` (Slate-950)   | Main app background.                      |
| **Background - Secondary**            | `#f8fafc` (Slate-50)    | `#1e293b` (Slate-800)   | Sidebars, card backgrounds.               |
| **Foreground - Primary**              | `#0f172a` (Slate-950)   | `#f1f5f9` (Slate-100)   | Primary text.                             |
| **Foreground - Secondary**            | `#64748b` (Slate-500)   | `#94a3b8` (Slate-400)   | Labels, helper text.                      |
| **Border**                            | `#e2e8f0` (Slate-200)   | `#334155` (Slate-700)   | Separators, card borders.                 |
| **Success**                           | `#10b981` (Emerald-500) | `#34d399` (Emerald-400) | "Accept" button, positive actions.        |
| **Warning/Destructive**               | `#ef4444` (Red-500)     | `#f87171` (Red-400)     | "Reject" button, errors.                  |

### 2.2 Typography

Use a clean, highly readable sans-serif stack.

- **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `'Roboto'`, `sans-serif`
- **Scale (using Tailwind's `font-size`/`line-height`):**
  - `text-xs` (12px/16px): Micro-labels, timestamps.
  - `text-sm` (14px/20px): Sidebar text, helper text.
  - `text-base` (16px/24px): Primary body text in chat.
  - `text-lg` (18px/28px): Section headings.
  - `text-xl` (20px/28px): Main panel titles.
  - `text-2xl` (24px/32px): App title/logo.

### 2.3 Icons & Imagery

- **Icon Library:** Use `lucide-react` for a consistent, clean, and comprehensive icon set.
- **Provider Logos:** Use official, monochrome (tinted with foreground color) logos for AI providers in the selector.
- **Fallback:** If a specific provider logo is unavailable, use the `BrainCircuit` or `Sparkles` icon from `lucide-react`.
- **File Icons:** Use simple, recognizable icons for common file types (file-text, file-code, folder, etc.).

## 3. Layout & Application Structure

### 3.1 Global Layout (Three-Pane Design)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 [Logo] AIDE              [ProviderSelector] ──⚙️── [UserAvatar] │
│ [3D] [Quantum] [Collab] [Voice]                                    │
├───────┬────────────────────────────────────────────────────────────────┬─────┤
│       │                                                       │     │
│ FILE  │                    CHAT PANEL                         │ACT. │
│ TREE  │   [AI Message Bubble]                                 │LOG  │
│ [3D]  │   [Quantum Optimization Panel]                       │[COLLAB]│
│       │   [User Message Bubble]                               │     │
│       │   ┌─────────────────────────────────────────────────────┐     │     │
│       │   │ 💬 [ChatInput]               [Attach] [Send]│     │     │
│       │   │ 🎤 [Voice] 🧠 [WebGPU] ⚛️ [Quantum]        │     │     │
│       │   └─────────────────────────────────────────────────────┘     │     │
├───────┴────────────────────────────────────────────────────────────────┴─────┤
│ [WebGPU: Active] [Quantum: Ready] [Collab: 3 users] [Status: Ready] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1.  **Header Bar:** Contains App Logo, **Provider Selector**, Settings gear, and User avatar.
2.  **Left Sidebar (File Tree):** Collapsible. Shows the workspace directory structure.
3.  **Central Panel (Chat):** The main conversation area. Contains message bubbles and the fixed chat input at the bottom.
4.  **Right Sidebar (Activity Log):** Collapsible. Shows a chronological log of system events: "File 'x' read", "Edit proposed for 'y'", "Changes accepted".
5.  **Status Bar (Bottom):** Shows current workspace path and system status ("Thinking...", "Ready", "Offline").

## 4. Core Components & Interactions

### 4.1 Provider Selector & Settings

- **Default State:** A button in the header showing the current provider's logo and name (e.g., `▣ OpenAI GPT-4`).
- **On Click:** Opens a clean dropdown/modal with:
  - A list of all configured providers as cards (`Card` component).
  - Each card shows:
    - **Logo:** Provider icon (from config)
    - **Name:** Provider name (from config)
    - **Model:** Currently selected model, or "No model selected" if `selectedModel` is `null`
    - **Status Badge:** `Connected` / `Configure` / `Error`
    - **Provider Type Badge:** `Cloud` / `Local` / `WebGPU` / `Quantum` / `CLI`
    - **Performance Indicator:** Speed/latency for local providers
  - An `Add New Provider...` button at the bottom, leading to the full Settings page.
- **Model Selection:** When user selects a provider, the app fetches available models from the provider's API (see `PROVIDERS.md`) and displays them in a dropdown for selection.
- **Settings Page:** A dedicated page/modal with a form to add/edit providers. Uses a stepper for clarity: 1. Choose Type (OpenAI/Anthropic), 2. Enter Details (Endpoint, Key), 3. Test Connection.

### 4.2 Chat Interface

- **Message Bubbles:**
  - **User:** Right-aligned. Solid primary background color. Tailwind example: `ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-none`.
  - **AI:** Left-aligned. Subtle secondary background. `bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none`.
  - **System:** Centered, muted text. `text-center text-muted-foreground text-sm italic`.
- **Chat Input:** A sticky bar at the bottom of the central panel. Contains:
  - A textarea that grows with content.
  - An "Attach File/Context" button (paperclip icon) to explicitly add files to the context.
  - A "Send" button (paper plane icon). Changes to a "Stop" button (circle) while generating.

### 4.3 File Diff Modal (The Trust Center)

This modal appears when the AI proposes a file edit.

- **Title:** `Review changes to src/utils/helper.js`
- **Content:** A side-by-side or unified **code diff viewer** (using Monaco Editor's diffing). Changes are highlighted in standard diff colors (green for additions, red for deletions).
- **Actions (Button Bar):**
  - `Reject` (Secondary/Outline variant): Discards the proposal.
  - `Accept & Apply` (Primary/Success variant): Applies the change to the file.
  - `Copy Changes` (Tertiary/Link variant): Copies the diff text to clipboard.
- **Overlay:** The rest of the app is covered by a solid, high-contrast overlay (`bg-background/95`) to focus entirely on the diff. Blur and translucency are strictly forbidden here.

### 4.4 File Tree Sidebar

- Mimics VS Code's explorer. Uses a recursive tree component.
- Highlights the file currently being discussed in the chat with a subtle primary background.
- Right-click context menu: `Open in Chat`, `Reveal in Finder/Explorer`.

### 4.10 Revolutionary Interface Components

#### Local WebGPU Inference Panel

- **Hardware Status:** GPU utilization, memory usage, temperature
- **Model Loading:** Progress bar for quantized model loading (GGUF files)
- **Performance Metrics:** Tokens/second, latency, power consumption
- **Fallback Indicator:** Shows when falling back to WASM/CPU

#### Quantum Computing Interface

- **Circuit Visualization:** Quantum circuit representation of optimization problems
- **Algorithm Selection:** QAOA, VQE, Grover algorithm chooser
- **Qubit Status:** Real-time qubit state visualization
- **Quantum Advantage:** Speedup metrics vs classical algorithms

#### 3D Workspace Controls

- **View Mode Toggle:** 2D/3D workspace switcher
- **Spatial Navigation:** Orbit, pan, zoom controls
- **Depth Layers:** File hierarchy depth visualization
- **Physics Settings:** Enable/disable physics-based interactions

#### Collaboration Panel

- **Active Users:** Real-time presence indicators with avatars
- **Voice Chat:** Spatial audio controls and mute/unmute
- **Screen Share:** Share specific code sections or entire workspace
- **Conflict Resolution:** Visual merge interface for simultaneous edits

#### Blockchain Audit Viewer

- **Transaction Log:** Immutable record of all file operations
- **Integrity Status:** Cryptographic verification indicators
- **Compliance Dashboard:** Security audit reports and metrics
- **Post-Quantum Status:** Encryption algorithm status and updates

The command palette provides keyboard-first navigation for power users.

**Trigger:** `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux)

#### Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Type a command or search...              │
├─────────────────────────────────────────────────────────────┤
│ Recently Used                               │
│   ↩ Switch to Claude 3.5 Sonnet            │
│   ↩ Open Settings                          │
├─────────────────────────────────────────────────────────────┤
│ Actions                                     │
│   📄 Open Workspace...              Cmd+O   │
│   💬 New Conversation              Cmd+N   │
│   ⚙️ Open Settings                 Cmd+,   │
├─────────────────────────────────────────────────────────────┤
│ Providers                                   │
│   ▣ Switch to OpenRouter (claude-3.5-sonnet) │
│   ◈ Switch to Groq (llama3-70b)             │
│   ◇ Switch to Local Ollama (llama3)         │
│   🧠  Switch to WebGPU (codellama-7b-q4)     │
│   ⚛️ Switch to Quantum Optimizer            │
├─────────────────────────────────────────────────────────────┤
│ Revolutionary Features                      │
│   🌌 Toggle 3D Workspace            Cmd+3   │
│   ⚛️ Open Quantum Optimizer         Cmd+Shift+Q |
│   🧠  Toggle Local WebGPU Inference  Cmd+G   │
│   👥 Toggle Multiplayer Mode        Cmd+M   │
│   🎤 Toggle Voice Control           Cmd+V   │
│   🕰 Time Travel Debugging          Cmd+T   │
├─────────────────────────────────────────────────────────────┤
│ Files (in workspace)                        │
│   📄 src/main.ts                           │
│   📄 src/components/chat.tsx               │
└─────────────────────────────────────────────────────────────┘
```

#### Implementation:

```tsx
import { Command } from "cmdk";
import { useUIStore } from "@/stores/ui-store";

export function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette } = useUIStore();

  return (
    <Command.Dialog
      open={commandPaletteOpen}
      onOpenChange={toggleCommandPalette}
    >
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Actions">
          <Command.Item onSelect={() => openWorkspace()}>
            <FolderIcon /> Open Workspace...
            <kbd>⌘O</kbd>
          </Command.Item>
          <Command.Item onSelect={() => newConversation()}>
            <MessageIcon /> New Conversation
            <kbd>⌘N</kbd>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Providers">
          {providers.map((p) => (
            <Command.Item key={p.id} onSelect={() => switchProvider(p)}>
              <ProviderIcon provider={p.type} />
              Switch to {p.name}{" "}
              {p.selectedModel ? `(${p.selectedModel})` : "(No model)"}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

### 4.6 Toast Notifications (Sonner)

Toasts provide non-blocking feedback for user actions.

#### Toast Types:

| Type        | Use Case                       | Duration        |
| ----------- | ------------------------------ | --------------- |
| **Success** | File saved, Provider connected | 3s              |
| **Error**   | API failure, File write error  | 5s (persistent) |
| **Info**    | Status updates                 | 3s              |
| **Loading** | Async operations               | Until complete  |

#### Implementation:

```tsx
import { toast } from "sonner";

// Success toast
toast.success("Changes applied to main.ts");

// Error toast with action
toast.error("Failed to connect to OpenAI", {
  action: {
    label: "Retry",
    onClick: () => retryConnection(),
  },
});

// Loading toast with promise
toast.promise(saveFile(), {
  loading: "Saving changes...",
  success: "File saved successfully",
  error: "Failed to save file",
});
```

#### Styling:

```tsx
// In App.tsx or layout
import { Toaster } from "sonner";

<Toaster
  theme="system"
  position="bottom-right"
  toastOptions={{
    style: {
      background: "var(--background)",
      border: "1px solid var(--border)",
      color: "var(--foreground)",
    },
  }}
/>;
```

### 4.7 Error States & Modals

Critical errors require dedicated modal treatment, not just toasts.

#### Error Modal Types

| Error Type                  | Modal Title             | Content                                                                                     | Actions                             |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| **API Key Invalid**         | "Authentication Failed" | "Your API key for [Provider] was rejected. Please check your key and try again."            | [Open Settings] [Dismiss]           |
| **Connection Failed**       | "Connection Error"      | "Could not connect to [Provider]. Check your internet connection or the provider's status." | [Retry] [Switch Provider] [Dismiss] |
| **File Write Failed**       | "File Save Error"       | "Could not save changes to `[filename]`. The file may be read-only or in use."              | [Retry] [Save As...] [Dismiss]      |
| **File Read Failed**        | "File Read Error"       | "Could not read `[filename]`. The file may have been moved or deleted."                     | [Refresh Workspace] [Dismiss]       |
| **Workspace Access Denied** | "Permission Denied"     | "AIDE cannot access this folder. Please select a different workspace."                      | [Select New Workspace] [Dismiss]    |
| **Model Fetch Failed**      | "Models Unavailable"    | "Could not fetch models from [Provider]. Using cached list."                                | [Use Cached] [Retry] [Dismiss]      |

#### Error Modal Design

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Authentication Failed                     [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Your API key for OpenRouter was rejected.          │
│  Please check your key and try again.               │
│                                                     │
│  Error details:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 401 Unauthorized - Invalid API key          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                     │
│  [Open Settings]                      [Dismiss]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Implementation

```tsx
// components/ui/error-modal.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, XCircle, WifiOff } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  type: "auth" | "connection" | "file" | "permission";
  title: string;
  message: string;
  details?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function ErrorModal({
  open,
  onClose,
  type,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
}: ErrorModalProps) {
  const icons = {
    auth: <XCircle className="h-6 w-6 text-destructive" />,
    connection: <WifiOff className="h-6 w-6 text-destructive" />,
    file: <AlertTriangle className="h-6 w-6 text-warning" />,
    permission: <AlertTriangle className="h-6 w-6 text-destructive" />,
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {icons[type]}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        {details && (
          <div className="bg-muted p-3 rounded-md text-sm font-mono">
            {details}
          </div>
        )}

        <AlertDialogFooter>
          {secondaryAction && (
            <AlertDialogAction
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </AlertDialogAction>
          )}
          {primaryAction && (
            <AlertDialogAction onClick={primaryAction.onClick}>
              {primaryAction.label}
            </AlertDialogAction>
          )}
          <AlertDialogAction variant="ghost" onClick={onClose}>
            Dismiss
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### Error Handling Flow

```
1. Error occurs (API call fails, file write fails, etc.)
         ↓
2. Determine error severity:
   - Minor (network timeout) → Toast with retry
   - Major (auth failed) → Error Modal
   - Critical (workspace inaccessible) → Error Modal + block UI
         ↓
3. Display appropriate feedback
         ↓
4. Log error to Activity Log (if enabled)
         ↓
5. User takes action or dismisses
```

## 5. Key User Flows & Micro-interactions

### 5.1 Switching Providers

- User clicks header selector → sees dropdown → hovers over a provider card (slight scale uplift) → clicks new provider → header updates instantly, a system message appears in chat: "Now chatting with [Provider Name] using [Model Name]."

### 5.2 Requesting a File Edit

- User types: "Add error handling to `api.js`".
- **State 1:** Input shows a loading indicator. Status bar: `Thinking...`.
- **State 2:** A non-blocking toast appears: `Proposing changes...`. Diff modal slides in.
- **State 3:** User reviews diff, clicks `Accept`. Modal closes with a smooth fade. A system message appears in chat: `✅ Changes applied to api.js`. Activity log adds an entry.

### 5.3 Adding a New AI Provider

- User goes to Settings → Clicks `Add Provider` → selects provider type from a visual grid → form appears with fields pre-filled for the endpoint → user pastes key → clicks `Test Connection` → button shows spinner → success checkmark appears → `Save` button becomes active.
- **Next Step:** After saving, user must select a model (models are fetched from API).

### 5.4 Selecting a Model for a Provider

- User clicks on a provider in the Provider Selector dropdown.
- **State 1:** Loading spinner appears. App calls provider's `/models` endpoint.
- **State 2:** Models dropdown appears showing available models.
- **State 3:** User selects a model → `selectedModel` is saved.
- **State 4:** Provider card updates to show selected model. Toast: `"Now using [model] with [provider]"`.
- **Edge Case:** If `/models` endpoint fails, show fallback models with a warning.

### 5.5 Keyboard Shortcuts

| Shortcut               | Action                        | Context            |
| ---------------------- | ----------------------------- | ------------------ |
| `Cmd/Ctrl + K`         | Open command palette          | Global             |
| `Cmd/Ctrl + O`         | Open workspace                | Global             |
| `Cmd/Ctrl + N`         | New conversation              | Global             |
| `Cmd/Ctrl + ,`         | Open settings                 | Global             |
| `Cmd/Ctrl + B`         | Toggle sidebar                | Global             |
| `Cmd/Ctrl + 3`         | Toggle 3D workspace           | Global             |
| `Cmd/Ctrl + Shift + Q` | Open quantum optimizer        | Global             |
| `Cmd/Ctrl + G`         | Toggle Local WebGPU inference | Global             |
| `Cmd/Ctrl + M`         | Toggle multiplayer mode       | Global             |
| `Cmd/Ctrl + V`         | Toggle voice control          | Global             |
| `Cmd/Ctrl + T`         | Time travel debugging         | Global             |
| `Cmd/Ctrl + Shift + B` | Open blockchain audit         | Global             |
| `Cmd/Ctrl + Enter`     | Send message                  | Chat input focused |
| `Escape`               | Close modal/palette           | When open          |
| `Cmd/Ctrl + 1-9`       | Switch provider               | Global             |
| `Cmd/Ctrl + Shift + A` | Accept diff                   | Diff modal open    |
| `Cmd/Ctrl + Shift + R` | Reject diff                   | Diff modal open    |

#### Implementation:

```tsx
// hooks/use-keyboard-shortcuts.ts
import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useKeyboardShortcuts() {
  const { toggleCommandPalette, toggleSidebar } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }

      if (isMod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
```

## 6. Recommended Tools & Implementation

### Core UI Stack

| Library      | Version | Purpose           |
| ------------ | ------- | ----------------- |
| React        | 18.x    | UI framework      |
| TypeScript   | 5.x     | Type safety       |
| Tailwind CSS | 4.0     | Styling           |
| shadcn/ui    | latest  | Component library |

### Enhanced Components

| Library                | Purpose             | Usage                      |
| ---------------------- | ------------------- | -------------------------- |
| **CMDK**               | Command palette     | `Cmd+K` navigation         |
| **Sonner**             | Toast notifications | User feedback              |
| **Vaul**               | Drawer component    | Mobile-like panels         |
| **Framer Motion**      | Animations          | Micro-interactions         |
| **Three.js**           | 3D workspace        | Spatial code visualization |
| **@react-three/fiber** | React Three.js      | 3D React components        |
| **Yjs**                | CRDT collaboration  | Real-time multiplayer      |
| **WebRTC**             | P2P communication   | Voice chat, screen share   |

### Code & Editor

| Library           | Purpose                    |
| ----------------- | -------------------------- |
| **Monaco Editor** | Diff viewer, code display  |
| **Shiki**         | Syntax highlighting themes |

### State & Data

| Library            | Purpose                |
| ------------------ | ---------------------- |
| **Zustand**        | Global client state    |
| **TanStack Query** | Server state & caching |
| **Drizzle ORM**    | Database operations    |

### Development

| Library        | Purpose              |
| -------------- | -------------------- |
| **Biome**      | Linting + formatting |
| **Vitest**     | Unit testing         |
| **Playwright** | E2E testing          |

## 7. Accessibility (A11y) Checklist

- [ ] All interactive elements have focus states (`focus:ring-2`).
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1).
- [ ] Images and icons have proper `alt` text or `aria-label`.
- [ ] The diff viewer is navigable via keyboard.
- [ ] Screen reader announcements for critical events (e.g., "Edit proposed", "Changes saved").

## 8. Data Integration & References

- **AI Provider Configurations:** The visual components in this design (Provider Selector, Settings page) pull their data and logic from the technical specifications defined in [`PROVIDERS.md`](./PROVIDERS.md).
- **Example:** The "Add Provider" form in Section 4.1 is built to populate the configuration schema defined in `PROVIDERS.md`.

---

## 9. Advanced Visual & Motion Guidelines (High-Gloss / Fluid)

**Directive:** Implement a "High-Gloss" aesthetic using Glassmorphism and Fluid Motion, but strictly subordinate to trust, clarity, and performance.

### 9.1 Approved Visual Enhancements

- **Framer Motion:** Use for state transitions (provider switch, toast in/out, modal enter/exit, file tree expand).
  - **Constraint:** Durations ≤ 200ms. No easing that implies "action completed" prematurely.
- **Three.js Integration:** 3D workspace with smooth camera transitions and physics-based interactions.
- **WebGPU Shaders:** Hardware-accelerated visual effects for performance indicators and quantum visualizations.
- **Quantum Visualization:** Circuit diagrams and qubit state representations with real-time updates.
- **Collaborative Cursors:** Real-time multiplayer cursors with smooth interpolation and user identification.
- **Radix/shadcn base:** Maintain for all interactive components to ensure keyboard/A11y invariants.
- **Selective Glassmorphism:**
  - **Allowed:** Header bar, Modals (outer frame), Sidebars (subtle backdrop-blur).
  - **BANNED:** The Diff Viewer and Code Surfaces MUST remain high-contrast and opaque.
- **Revolutionary Features:**
  - **3D Workspace:** Immersive code visualization with spatial navigation
  - **Quantum Interface:** Circuit visualization and algorithm selection
  - **WebGPU Indicators:** Real-time hardware acceleration status
  - **Collaboration UI:** Multi-user presence and conflict resolution

### 4.8 3D Workspace Visualization

Immersive code exploration using Three.js and spatial computing.

#### 3D Code Architecture View

```typescript
// 3D workspace with code relationships
export const Workspace3D = () => {
  const { nodes, edges } = useCodeGraph()

  return (
    <Canvas>
      <CodeArchitecture3D
        nodes={nodes}
        edges={edges}
        onNodeSelect={navigateToCode}
        physics={true}
        clustering={true}
      />
      <OrbitControls />
      <Environment preset="studio" />
    </Canvas>
  )
}
```

### 4.9 Multiplayer Collaboration Interface

Real-time presence indicators and collaborative editing UI.

#### Collaborative Cursors

```typescript
// Multi-user cursor tracking
export const CollaborativeCursors = () => {
  const { users, awareness } = useCollaboration()

  return (
    <>
      {users.map(user => (
        <UserCursor
          key={user.id}
          position={user.cursor}
          color={user.color}
          name={user.name}
          isTyping={user.isTyping}
        />
      ))}
    </>
  )
}
```

---

_This is a living document. Update as design decisions are made during implementation._

### 3D Workspace Visualization

AIDE includes an immersive 3D workspace for spatial code navigation and visualization.

#### 3D File Tree

- **Spatial Layout:** Files and folders arranged in 3D space with depth indicating hierarchy
- **Interactive Navigation:** Mouse/keyboard controls for rotating, zooming, and panning
- **Visual Connections:** Lines connecting related files (imports, dependencies)
- **Code Density:** File size represented by visual volume/height
- **Activity Heatmap:** Recent changes shown with color intensity

#### 3D Code Editor

- **Layered Views:** Multiple files open as floating panels in 3D space
- **Semantic Visualization:** Functions, classes, and modules as 3D objects
- **Dependency Graph:** Real-time 3D visualization of code relationships
- **Collaborative Cursors:** Other users' cursors visible in 3D space during multiplayer

### Multiplayer Collaboration Interface

Real-time collaborative editing with end-to-end encryption and conflict resolution.

#### Collaboration Panel

- **Active Users:** List of connected collaborators with avatars
- **Presence Indicators:** Real-time cursor positions and selections
- **Voice Chat:** Integrated voice communication with spatial audio
- **Screen Sharing:** Share specific code sections or entire workspace

#### Conflict Resolution UI

- **Merge Interface:** Visual diff viewer for conflicting changes
- **Version History:** Timeline view of all collaborative edits
- **Rollback Controls:** One-click revert to previous states
- **Permission System:** Role-based access control (read, write, admin)

### Quantum Computing Interface

Code optimization using quantum algorithms and simulators.

#### Quantum Optimizer Panel

- **Circuit Visualization:** Quantum circuit representation of optimization problems
- **Algorithm Selection:** Choose from quantum optimization algorithms (QAOA, VQE, etc.)
- **Performance Metrics:** Quantum speedup indicators and classical comparison
- **Simulator Controls:** Select quantum backend (local simulator, cloud quantum computers)

#### Quantum Code Analysis

- **Complexity Mapping:** Visualize code complexity as quantum state space
- **Optimization Suggestions:** AI-powered recommendations using quantum algorithms
- **Quantum Profiler:** Performance analysis using quantum computing principles

### Advanced Motion & Physics

Cinematic user experience with physics-based interactions.

#### Physics Engine

- **Realistic Animations:** Smooth, physics-based transitions for all UI elements
- **Gesture Recognition:** Natural hand gestures for 3D navigation
- **Haptic Feedback:** Tactile responses for interactions (requires compatible hardware)
- **Particle Effects:** Visual feedback for file operations and AI thinking states

#### Adaptive Interface

- **Eye Tracking:** Interface adapts based on user's gaze patterns
- **Context Awareness:** UI elements appear/disappear based on current task
- **Predictive Layout:** Interface anticipates user needs and pre-loads relevant panels
- **Biometric Integration:** Stress detection to adjust interface complexity

### Voice and Gesture Control

Natural interaction methods beyond keyboard and mouse.

#### Voice Commands

- **File Operations:** "Open main.py", "Save all files", "Create new component"
- **AI Interaction:** "Ask Claude to review this function", "Generate tests for this class"
- **Navigation:** "Go to line 42", "Find all references", "Switch to terminal"
- **Workspace Control:** "Show file tree", "Hide sidebar", "Enter focus mode"

#### Gesture Recognition

- **Hand Tracking:** 3D hand tracking for spatial navigation
- **Air Gestures:** Pinch, swipe, and rotate gestures for code manipulation
- **Multi-touch:** Advanced touch gestures on compatible displays
- **Eye Gestures:** Blink patterns for hands-free control

### Time Travel Debugging

Event sourcing with complete history replay and quantum-enhanced debugging.

#### Timeline Interface

- **Event Stream:** Chronological view of all code changes and AI interactions
- **Branching Visualization:** Git-like branching for different debugging paths
- **State Snapshots:** Instant restoration to any previous application state
- **Quantum Replay:** Use quantum algorithms to explore multiple debugging scenarios simultaneously

#### Debug Controls

- **Temporal Navigation:** Step forward/backward through code execution
- **Parallel Debugging:** Debug multiple code paths simultaneously
- **Predictive Debugging:** AI predicts potential bugs before they occur
- **Quantum Debugging:** Explore superposition of possible bug states

### Blockchain Audit System

Immutable audit trail with post-quantum cryptography.

#### Audit Dashboard

- **Transaction Log:** All file operations recorded on local blockchain
- **Integrity Verification:** Cryptographic proof of file authenticity
- **Access History:** Complete record of who accessed what and when
- **Compliance Reports:** Automated generation of security compliance reports

#### Security Controls

- **Post-Quantum Encryption:** Future-proof cryptographic algorithms
- **Zero-Knowledge Proofs:** Verify operations without revealing sensitive data
- **Multi-Signature Approval:** Require multiple approvals for critical operations
- **Quantum Key Distribution:** Ultra-secure key exchange using quantum mechanics

---

## 5. Component Library & Design System

### 5.1 Core Components

All components follow the design principles and use the semantic color tokens defined in Section 2.

#### Button Component

```tsx
interface ButtonProps {
  variant: "primary" | "secondary" | "destructive" | "ghost";
  size: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

#### Card Component

```tsx
interface CardProps {
  variant: "default" | "elevated" | "outlined";
  padding: "sm" | "md" | "lg";
  children: React.ReactNode;
}
```

#### Modal/Dialog Component

```tsx
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

### 5.2 Specialized Components

#### Provider Selector

- Dropdown showing configured providers
- Each provider card displays: logo, name, selected model, status
- "Add New Provider" option at bottom
- Model selection dropdown appears after provider selection

#### Diff Viewer

- Side-by-side or unified diff view
- Syntax highlighting with Shiki
- Line numbers and change indicators
- Accept/Reject action buttons
- Copy changes functionality

#### File Tree

- Collapsible directory structure
- File type icons
- Search/filter functionality
- Drag and drop support
- Context menu for file operations

#### Chat Interface

- Message bubbles with role-based styling
- Typing indicators
- Message timestamps
- Code block syntax highlighting
- File attachment indicators

### 5.3 Animation Guidelines

- **Duration:** Keep animations under 200ms for responsiveness
- **Easing:** Use `ease-out` for entering, `ease-in` for exiting
- **Respect Preferences:** Honor `prefers-reduced-motion`
- **Purpose:** Animations should provide feedback or guide attention
- **Consistency:** Use consistent timing and easing across components

### 5.4 Accessibility Standards

- **WCAG AA Compliance:** All components meet WCAG 2.1 AA standards
- **Keyboard Navigation:** Full keyboard accessibility with logical tab order
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 contrast ratio for text
- **Focus Indicators:** Clear visual focus indicators for all interactive elements

### 5.5 Responsive Design

- **Breakpoints:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Fluid Typography:** Responsive font sizes using clamp()
- **Flexible Layouts:** CSS Grid and Flexbox for adaptive layouts
- **Touch Targets:** Minimum 44px touch targets on mobile
- **Content Priority:** Progressive disclosure on smaller screens

---

## 6. User Experience Flows

### 6.1 First-Time Setup Flow

1. **Welcome Screen:** Brief introduction to AIDE capabilities
2. **Provider Configuration:** Add first AI provider with guided setup
3. **Model Selection:** Choose model from fetched list
4. **Workspace Selection:** Select project directory
5. **Quick Tour:** Interactive tutorial of main features
6. **First Chat:** Guided first interaction with AI

### 6.2 Daily Usage Flow

1. **Launch:** App opens to last workspace and provider
2. **Quick Actions:** Command palette for common tasks
3. **File Operations:** Browse, open, and edit files
4. **AI Interaction:** Chat with AI about code
5. **Review Changes:** Approve/reject AI suggestions
6. **Collaboration:** Invite others for real-time editing

### 6.3 Error Recovery Flow

1. **Error Detection:** Clear error messages with context
2. **Suggested Actions:** Actionable steps to resolve issues
3. **Fallback Options:** Alternative approaches when primary fails
4. **Support Resources:** Links to documentation and help
5. **State Recovery:** Restore to last known good state

---

## 7. Implementation Guidelines

### 7.1 Component Development

- Use TypeScript for all components
- Follow React best practices and hooks patterns
- Implement proper error boundaries
- Include comprehensive prop validation
- Write unit tests for all components

### 7.2 Styling Approach

- Use Tailwind CSS utility classes
- Create custom CSS variables for theme tokens
- Implement dark/light mode support
- Use CSS-in-JS sparingly for dynamic styles
- Maintain consistent spacing scale

### 7.3 Performance Considerations

- Lazy load non-critical components
- Implement virtual scrolling for large lists
- Optimize re-renders with React.memo
- Use proper key props for list items
- Monitor bundle size and code splitting

### 7.4 Testing Strategy

- Unit tests for individual components
- Integration tests for user flows
- Visual regression tests for UI consistency
- Accessibility tests with automated tools
- Performance tests for critical paths

---

## 8. Future Enhancements

### 8.1 Advanced Features

- **Plugin System:** Third-party extensions and themes
- **Custom Workflows:** User-defined automation sequences
- **Advanced Analytics:** Code quality metrics and insights
- **Team Management:** Organization-level user and permission management
- **API Integration:** Connect with external development tools

### 8.2 Platform Expansion

- **Web Version:** Browser-based AIDE for cloud development
- **Mobile Companion:** Mobile app for code review and monitoring
- **VS Code Extension:** Integration with popular editors
- **CLI Tool:** Command-line interface for automation
- **Cloud Sync:** Synchronize settings and workspaces across devices

---

This UI/UX specification provides comprehensive guidance for implementing AIDE's user interface with a focus on usability, accessibility, and advanced features. All components should be implemented following these guidelines to ensure a consistent and professional user experience.
