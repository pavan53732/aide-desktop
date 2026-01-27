# AIDE - UI/UX Design Specification

> Stability Tier: Core UI Law
> Last Amended: 2026-01-28
> Governing Document: SPECIFICATIONS.md

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
| 5   | **Keyboard-first design**                   | All actions must be accessible via keyboard shortcuts. See Section 5.5.                                    |
| 6   | **No hardcoded provider/model names in UI** | UI components must read from config, never hardcode "GPT-4" or "Claude" in JSX.                            |
| 7   | **Accessibility is mandatory**              | All components must meet WCAG AA standards.                                                                |
| 8   | **Trust Surfaces Are Minimal**              | The Diff Modal, Error Modals, and Permission Prompts must never use glassmorphism, gradients, glow, 3D, or motion. |
| 9   | **No Emotional AI Signaling**               | UI must not imply intent, confidence, mood, or agency of the AI system.                                    |
| 10  | **Performance Before Spectacle**            | Visual effects must degrade gracefully or disable automatically when performance drops below target FPS.   |
| 11  | **System Messages Are Neutral**             | System messages must be factual and non-anthropomorphic.                                                   |
| 12  | **Neutral System Language**                 | UI text must avoid anthropomorphic or emotional phrasing. Use operational language instead (e.g., "Processing request", "Response streaming"). |

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

| Role                       | Light Theme             | Dark Theme              | Usage                                    |
| :------------------------- | :---------------------- | :---------------------- | :--------------------------------------- |
| **Primary**                | `#3b82f6` (Blue-600)    | `#60a5fa` (Blue-400)    | Primary buttons, active states, accents. |
| **Background - Primary**   | `#ffffff`               | `#0f172a` (Slate-950)   | Main app background.                     |
| **Background - Secondary** | `#f8fafc` (Slate-50)    | `#1e293b` (Slate-800)   | Sidebars, card backgrounds.              |
| **Foreground - Primary**   | `#0f172a` (Slate-950)   | `#f1f5f9` (Slate-100)   | Primary text.                            |
| **Foreground - Secondary** | `#64748b` (Slate-500)   | `#94a3b8` (Slate-400)   | Labels, helper text.                     |
| **Border**                 | `#e2e8f0` (Slate-200)   | `#334155` (Slate-700)   | Separators, card borders.                |
| **Success**                | `#10b981` (Emerald-500) | `#34d399` (Emerald-400) | "Accept" button, positive actions.       |
| **Warning/Destructive**    | `#ef4444` (Red-500)     | `#f87171` (Red-400)     | "Reject" button, errors.                 |

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
├───────┬────────────────────────────────────────────────────────────────┬─────┤
│       │                                                       │     │
│ FILE  │                    CHAT PANEL                         │ACT. │
│ TREE  │   [AI Message Bubble]                                 │LOG  │
│       │   [User Message Bubble]                               │     │
│       │   ┌─────────────────────────────────────────────────────┐     │     │
│       │   │ 💬 [ChatInput]               [Attach] [Send]│     │     │
│       │   └─────────────────────────────────────────────────────┘     │     │
├───────┴────────────────────────────────────────────────────────────────┴─────┤
│ [Status: Ready]                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1.  **Header Bar:** Contains App Logo, **Provider Selector**, Settings gear, and User avatar.
2.  **Left Sidebar (File Tree):** Collapsible. Shows the workspace directory structure.
3.  **Central Panel (Chat):** The main conversation area. Contains message bubbles and the fixed chat input at the bottom.
4.  **Right Sidebar (Activity Log):** Collapsible. Shows a chronological log of system events: "File 'x' read", "Edit proposed for 'y'", "Changes accepted".
5.  **Status Bar (Bottom):** Shows current workspace path and system status ("Thinking...", "Ready", "Offline").

## 4. Core Components & Interactions

### 4.1 Provider Selector & Settings

- **Default State:** A button in the header showing the current provider's logo and name (e.g., `▣ {provider.name}`) and the selected model if available (e.g., `{provider.selectedModel ?? "No model selected"}`).
- **On Click:** Opens a clean dropdown/modal with:
  - A list of all configured providers as cards (`Card` component).
  - Each card shows:
    - **Logo:** Provider icon (from config)
    - **Name:** Provider name (from config)
    - **Model:** Currently selected model, or "No model selected" if `selectedModel` is `null`
    - **Status Badge:** `Connected` / `Configure` / `Error`
    - **Provider Type Badge:** `Cloud` / `Local` / `CLI`
    - **CLI Agent Note:** CLI agents show "Local Binary" status and don't have model selection (they use their own model configuration)
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

### Constitutional Restrictions

The following are explicitly prohibited inside the Diff Modal:
- Glassmorphism or backdrop blur
- Animated gradients, glow, neon, or particle effects
- 3D transforms or hover motion
- Interactive reveal sliders or cinematic loaders

The Diff Modal must render in a static, high-contrast, code-review-optimized layout at all times.

### 4.4 File Tree Sidebar

- Mimics VS Code's explorer. Uses a recursive tree component.
- Highlights the file currently being discussed in the chat with a subtle primary background.
- Right-click context menu: `Open in Chat`, `Reveal in Explorer`.

### 4.5 Command Palette

The command palette provides keyboard-first navigation for power users.

**Trigger:** `Ctrl+K`

#### Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Type a command or search...              │
├─────────────────────────────────────────────────────────────┤
│ Recently Used                               │
│   ↩ Switch to {provider.name} ({model})     │
│   ↩ Open Settings                          │
├─────────────────────────────────────────────────────────────┤
│ Actions                                     │
│   📄 Open Workspace...              Ctrl+O  │
│   💬 New Conversation              Ctrl+N  │
│   ⚙️ Open Settings                 Ctrl+,  │
├─────────────────────────────────────────────────────────────┤
│ Providers                                   │
│   ▣ Switch to {provider.name} ({selectedModel ?? "No model"}) │
│   ◇ Switch to {provider.name} ({selectedModel ?? "No model"}) │
│   🧠 Switch to {provider.name} ({selectedModel ?? "No model"}) │
│   ⚛️ Switch to {provider.name} ({selectedModel ?? "No model"}) │
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
            <kbd>Ctrl+O</kbd>
          </Command.Item>
          <Command.Item onSelect={() => newConversation()}>
            <MessageIcon /> New Conversation
            <kbd>Ctrl+N</kbd>
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

### 4.8 Future Feature Considerations

_Advanced features like 3D visualization and real-time collaboration are planned for future releases but not included in the MVP scope._

## 5. Key User Flows & Micro-interactions

### 5.1 Switching Providers

- User clicks header selector → sees dropdown → hovers over a provider card (slight scale uplift) → clicks new provider → header updates instantly, a system message appears in chat: "Now chatting with [Provider Name] using [Model Name]."

### 5.2 Requesting a File Edit

- User types: "Add error handling to `api.js`".
- **State 1:** Input shows a loading indicator. Status bar: `Thinking...`.
- **State 2:** A non-blocking toast appears: `Proposing changes...`. Diff modal appears instantly (no animation).
- **State 3:** User reviews diff, clicks `Accept`. Modal closes instantly. A system message appears in chat: `✅ Changes applied to api.js`. Activity log adds an entry.

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

| Shortcut          | Action               | Context         |
| ----------------- | -------------------- | --------------- |
| `Ctrl + K`        | Open command palette | Global          |
| `Ctrl + O`        | Open workspace       | Global          |
| `Ctrl + N`        | New conversation     | Global          |
| `Ctrl + ,`        | Open settings        | Global          |
| `Ctrl + B`        | Toggle sidebar       | Global          |
| `Ctrl + 1-9`      | Switch provider      | Global          |
| `Ctrl + Shift + A`| Accept diff          | Diff modal open |
| `Ctrl + Shift + R`| Reject diff          | Diff modal open |

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

## 6. Loading States & Skeleton Screens

### 6.1 Skeleton Component System

```typescript
// components/ui/skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// With shimmer effect
export function SkeletonShimmer({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
```

### 6.2 Component-Specific Skeletons

```typescript
// components/skeletons/chat-skeleton.tsx
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full" />
          
          {/* Message content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// File tree skeleton
export function FileTreeSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-full" style={{ width: `${Math.random() * 60 + 40}%` }} />
        </div>
      ))}
    </div>
  );
}

// Provider card skeleton
export function ProviderCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

// Model dropdown skeleton
export function ModelDropdownSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
```

### 6.3 Shimmer Animation

```css
/* globals.css */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}
```

## 7. Micro-interactions Library

### 7.1 Button Interactions

```typescript
// components/ui/animated-button.tsx
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

export function AnimatedButton({ 
  children, 
  loading, 
  variant = 'primary',
  onClick 
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative px-4 py-2 rounded-lg font-medium transition-colors",
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        }
      )}
      onClick={onClick}
      disabled={loading}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </motion.div>
      )}
      <span className={cn(loading && "invisible")}>{children}</span>
    </motion.button>
  );
}
```

### 7.2 Card Hover Effects

```typescript
// components/ui/animated-card.tsx
import { motion } from 'framer-motion';

export function HoverCard({ children, ...props }) {
  return (
    <motion.div
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
      }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      className="rounded-lg border bg-card p-6 cursor-pointer"
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Glow effect on hover
export function GlowCard({ children, ...props }) {
  return (
    <motion.div
      whileHover={{
        boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)"
      }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-card p-6 cursor-pointer"
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### 7.3 Loading Animations

```typescript
// components/ui/loading-spinner.tsx
import { motion } from 'framer-motion';

export function PulseLoader() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

export function SpinLoader() {
  return (
    <motion.div
      className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}
```

### 7.4 Success/Error Animations

```typescript
// components/ui/status-icons.tsx
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      className="flex items-center justify-center h-12 w-12 rounded-full bg-success"
    >
      <Check className="h-6 w-6 text-white" />
    </motion.div>
  );
}

export function ErrorCross() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive"
    >
      <X className="h-6 w-6 text-white" />
    </motion.div>
  );
}
```

## 8. Complete Design System

### 8.1 Spacing Scale Reference

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `space-0` | 0 | 0px | No spacing |
| `space-1` | 0.25rem | 4px | Tight spacing, icon gaps |
| `space-2` | 0.5rem | 8px | Small gaps between elements |
| `space-3` | 0.75rem | 12px | Default gap for inline elements |
| `space-4` | 1rem | 16px | Standard spacing unit |
| `space-6` | 1.5rem | 24px | Section padding |
| `space-8` | 2rem | 32px | Large section spacing |
| `space-12` | 3rem | 48px | Major section breaks |
| `space-16` | 4rem | 64px | Page section spacing |

### 8.2 Shadow Elevation System

```typescript
// Usage examples
<div className="shadow-sm">    // Subtle elevation
<div className="shadow">       // Default card elevation
<div className="shadow-md">    // Dropdown menus
<div className="shadow-lg">    // Modal dialogs
<div className="shadow-xl">    // Floating action buttons
<div className="shadow-2xl">   // Full-page overlays
```

### 8.3 Border Radius Guidelines

| Size | Value | Usage |
|------|-------|-------|
| `rounded-sm` | 2px | Badges, tags |
| `rounded` | 4px | Buttons, inputs |
| `rounded-md` | 6px | Cards (default) |
| `rounded-lg` | 8px | Large cards, modals |
| `rounded-xl` | 12px | Hero sections |
| `rounded-2xl` | 16px | Feature cards |
| `rounded-full` | 9999px | Avatars, pills |

### 8.4 Animation Timing Reference

```typescript
// Duration
export const duration = {
  instant: 0,
  fast: 150,      // Feedback
  normal: 300,    // Default
  slow: 500,      // Emphasis
  slower: 700     // Page transitions
};

// Easing
export const easing = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],         // Most common
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 400, damping: 30 }
};
```

## 9. UI Polish Implementation Guide

### 9.1 Hover States

```typescript
// Standard hover pattern
<div className="
  transition-colors duration-200
  hover:bg-accent hover:text-accent-foreground
  cursor-pointer
">

// With transform
<div className="
  transition-all duration-200
  hover:-translate-y-1 hover:shadow-lg
  cursor-pointer
">

// Button hover with scale
<button className="
  transition-transform duration-150
  hover:scale-105 active:scale-95
">
```

### 9.2 Focus States

```typescript
// Keyboard focus indicators
<input className="
  focus:outline-none
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-shadow duration-200
" />

// Button focus
<button className="
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
">
```

### 9.3 Active States

```typescript
// Button press feedback
<button className="
  active:scale-95 active:brightness-95
  transition-all duration-100
">

// Link press
<a className="
  active:text-primary/80
  transition-colors duration-100
">
```

### 9.4 Ripple Effect

```typescript
// components/ui/ripple-button.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export function RippleButton({ children, onClick }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples([...ripples, { x, y, id: Date.now() }]);
    
    setTimeout(() => {
      setRipples(ripples => ripples.slice(1));
    }, 600);
  };

  return (
    <button
      className="relative overflow-hidden px-4 py-2 rounded-lg bg-primary text-primary-foreground"
      onClick={(e) => {
        addRipple(e);
        onClick?.();
      }}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white"
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 0.5
          }}
          animate={{
            width: 200,
            height: 200,
            x: ripple.x - 100,
            y: ripple.y - 100,
            opacity: 0
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
      {children}
    </button>
  );
}
```

## 10. Vaul Drawer Implementation

### 10.1 Basic Drawer

```typescript
// components/ui/drawer.tsx
import { Drawer } from 'vaul';

export function BasicDrawer({ children, trigger }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        {trigger}
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-background rounded-t-[10px] flex-1 overflow-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### 10.2 Drawer with Snap Points

```typescript
export function SnapDrawer({ children }) {
  return (
    <Drawer.Root snapPoints={[0.2, 0.5, 0.9]} fadeFromIndex={0}>
      <Drawer.Trigger asChild>
        <button>Open Drawer</button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-background flex flex-col fixed bottom-0 left-0 right-0 rounded-t-[10px]">
          <div className="p-4">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-8" />
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## 11. Enhanced Toast Patterns

### 11.1 Custom Toast Variants

```typescript
// lib/toast-variants.ts
import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export const customToast = {
  success: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className="bg-background border rounded-lg shadow-lg p-4 flex gap-3">
        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    ));
  },

  error: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className="bg-background border border-destructive rounded-lg shadow-lg p-4 flex gap-3">
        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-destructive">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    ));
  },

  info: (message: string) => {
    toast.custom((t) => (
      <div className="bg-primary/10 border border-primary rounded-lg shadow-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    ));
  },

  warning: (message: string) => {
    toast.custom((t) => (
      <div className="bg-warning/10 border border-warning rounded-lg shadow-lg p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    ));
  }
};
```

### 11.2 Toast with Actions

```typescript
export function actionToast() {
  toast('File modified', {
    description: 'src/main.ts has unsaved changes',
    action: {
      label: 'Save',
      onClick: () => saveFile()
    },
    cancel: {
      label: 'Discard',
      onClick: () => discardChanges()
    }
  });
}
```

## 12. Recommended Tools & Implementation

### Core UI Stack

| Library      | Version | Purpose           |
| ------------ | ------- | ----------------- |
| React        | 18.2    | UI framework      |
| TypeScript   | 5       | Type safety       |
| Tailwind CSS | 3       | Styling           |
| shadcn/ui    | latest  | Component library |

### Enhanced Components

| Library           | Purpose             | Usage                    |
| ----------------- | ------------------- | ------------------------ |
| **CMDK**          | Command palette     | `Cmd+K` navigation       |
| **Sonner**        | Toast notifications | User feedback            |
| **Vaul**          | Drawer component    | Mobile-like panels       |
| **Framer Motion** | Animations          | Micro-interactions       |
| **tsparticles**   | Particle effects    | Background animations    |
| **react-syntax-highlighter** | Code display | Animated code blocks |

## 12. Glassmorphism & Modern Blur Effects

### 12.1 Glass Card Component

```typescript
// components/ui/glass-card.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
}

export function GlassCard({ children, className = '', intensity = 'medium' }: GlassCardProps) {
  const blurIntensity = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    strong: 'backdrop-blur-xl'
  };
  
  return (
    <motion.div
      className={`
        ${blurIntensity[intensity]}
        bg-white/10 dark:bg-black/10
        border border-white/20 dark:border-white/10
        rounded-2xl shadow-2xl
        hover:bg-white/20 dark:hover:bg-black/20
        transition-all duration-300
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

### 12.2 Glassmorphism Patterns

```typescript
// components/ui/glass-patterns.tsx

// Frosted glass effect
export function FrostedGlass({ children }) {
  return (
    <div className="
      backdrop-blur-2xl
      bg-gradient-to-br from-white/5 to-white/10
      border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.1)]
      rounded-3xl
      relative overflow-hidden
    ">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

// Ultra glass with border shine
export function UltraGlass({ children }) {
  return (
    <div className="relative group">
      {/* Animated border */}
      <div className="
        absolute -inset-0.5 
        bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
        rounded-2xl blur opacity-30 
        group-hover:opacity-60 
        transition duration-1000 
        group-hover:duration-200
      " />
      
      {/* Glass content */}
      <div className="
        relative backdrop-blur-xl
        bg-black/40 
        rounded-2xl 
        border border-white/10
        p-6
      ">
        {children}
      </div>
    </div>
  );
}
```

## 13. 3D Transformations & Card Effects

### 13.1 3D Card with Tilt

```typescript
// components/ui/card-3d.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export function Card3D({ children }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  return (
    <motion.div
      className="relative w-full h-full cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        setRotateX((y - centerY) / 10);
        setRotateY(-(x - centerX) / 10);
      }}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{
        rotateX,
        rotateY
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
```

### 13.2 3D Provider Card

```typescript
// components/providers/provider-card-3d.tsx
export function ProviderCard3D({ provider }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  return (
    <motion.div
      className="relative w-80 h-48 cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        setRotateX((y - centerY) / 10);
        setRotateY(-(x - centerX) / 10);
      }}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Holographic background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl" />
      
      {/* Dynamic shine effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${rotateY * 10 + 50}% ${rotateX * 10 + 50}%, rgba(255,255,255,0.2), transparent 50%)`
        }}
      />
      
      <div className="relative p-6 h-full flex flex-col justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
          >
            {provider.icon}
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold">{provider.name}</h3>
            <p className="text-sm text-muted-foreground">{provider.model || "No model selected"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusBadge status={provider.status} />
          <TypeBadge type={provider.type} />
        </div>
      </div>
    </motion.div>
  );
}
```

## 14. Advanced Gradient System

### 14.1 Animated Gradients

```typescript
// lib/gradients.ts
export const gradients = {
  // Static gradients
  aurora: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
  ocean: "bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500",
  sunset: "bg-gradient-to-r from-orange-400 via-red-500 to-pink-600",
  forest: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600",
  cosmic: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
  midnight: "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
  
  // Animated gradients
  animatedAurora: `
    bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
    bg-[length:200%_100%]
    animate-gradient
  `,
  animatedOcean: `
    bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500
    bg-[length:200%_100%]
    animate-gradient
  `
};
```

```css
/* globals.css */
@keyframes gradient {
  0%, 100% { 
    background-position: 0% 50%; 
  }
  50% { 
    background-position: 100% 50%; 
  }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}
```

### 14.2 Gradient Text

```typescript
// components/ui/gradient-text.tsx
export function GradientText({ children, gradient = "aurora" }) {
  return (
    <span className={`
      ${gradients[gradient]}
      bg-clip-text text-transparent
      font-bold
    `}>
      {children}
    </span>
  );
}
```

## 15. Neon & Glow Effects

### 15.1 Neon Button

```typescript
// components/ui/neon-button.tsx
export function NeonButton({ children, color = 'blue', ...props }) {
  const colors = {
    blue: {
      gradient: 'from-cyan-500 to-blue-500',
      shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)]'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)]'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:shadow-[0_0_40px_rgba(34,197,94,0.8)]'
    }
  };
  
  return (
    <motion.button
      className={`
        relative px-8 py-3 rounded-lg
        bg-gradient-to-r ${colors[color].gradient}
        ${colors[color].shadow}
        transition-all duration-300
        text-white font-bold
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

### 15.2 Glow Card

```typescript
// components/ui/glow-card.tsx
export function GlowCard({ children, glowColor = 'blue' }) {
  const glowColors = {
    blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    green: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]',
    pink: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]'
  };
  
  return (
    <motion.div
      className={`
        rounded-lg border bg-card p-6 cursor-pointer
        transition-all duration-300
        ${glowColors[glowColor]}
      `}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  );
}
```

## 16. Revolutionary Chat Interface

### 16.1 AI Avatar with Pulse

```typescript
// components/chat/ai-avatar.tsx
export function AIAvatar({ thinking = false }) {
  return (
    <motion.div
      className="relative"
      animate={thinking ? {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 0px rgba(59, 130, 246, 0.4)",
          "0 0 0 10px rgba(59, 130, 246, 0)",
          "0 0 0 0px rgba(59, 130, 246, 0)"
        ]
      } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      
      {thinking && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
```

### 16.2 Morphing Message Bubbles

> Accessibility Rule:  
> Morphing, blur, and gradient message bubbles must be disabled when `prefers-reduced-motion` is set or when accessibility mode is enabled.

```typescript
// components/chat/morphing-bubble.tsx
export function MorphingBubble({ children, isUser = false }) {
  return (
    <motion.div
      initial={{ scale: 0, borderRadius: "50%" }}
      animate={{ scale: 1, borderRadius: "1rem" }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
      className={`
        p-4 backdrop-blur-sm
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500/90 to-purple-500/90 text-white ml-auto' 
          : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
        }
      `}
    >
      {children}
    </motion.div>
  );
}
```

### 16.3 Advanced Typing Indicator

```typescript
// components/chat/ai-typing-indicator.tsx
export function AITypingIndicator() {
  return (
    <div className="flex gap-2 items-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg w-fit">
      <motion.div
        className="w-2 h-2 rounded-full bg-blue-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-purple-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-pink-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
      <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
    </div>
  );
}
```

## 17. Futuristic Navigation

### 17.1 Floating Action Button (FAB)

> Constitutional Rule:  
> The FAB must not provide any action that modifies files, providers, or workspace state directly.  
> It may only open UI navigation surfaces (Command Palette, Settings, Help).

```typescript
// components/layout/floating-action-button.tsx
export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div className="fixed bottom-6 right-6 z-50">
      <motion.button
        className="
          w-16 h-16 rounded-full
          bg-gradient-to-r from-blue-500 to-purple-500
          shadow-[0_8px_30px_rgba(59,130,246,0.5)]
          hover:shadow-[0_12px_40px_rgba(59,130,246,0.7)]
          flex items-center justify-center
          transition-all duration-300
        "
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-8 h-8 text-white" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            <FABAction icon={<FileCode />} label="New File" onClick={() => {}} />
            <FABAction icon={<MessageSquare />} label="New Chat" onClick={() => {}} />
            <FABAction icon={<Settings />} label="Settings" onClick={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FABAction({ icon, label, onClick }) {
  return (
    <motion.button
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      whileHover={{ scale: 1.1, x: -5 }}
      className="flex items-center gap-3 bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg"
      onClick={onClick}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
        {icon}
      </div>
    </motion.button>
  );
}
```

### 17.2 Magnetic Sidebar

```typescript
// components/layout/magnetic-sidebar.tsx
export function MagneticSidebar() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  return (
    <motion.div
      className="fixed left-0 h-screen w-64 backdrop-blur-xl bg-black/20 border-r border-white/10"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
    >
      {/* Magnetic glow effect */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64
        }}
        transition={{ type: "spring", damping: 15, stiffness: 150 }}
      />
      
      {/* Sidebar content */}
      <div className="relative z-10 p-4">
        {/* Navigation items */}
      </div>
    </motion.div>
  );
}
```

### Code & Editor

| Library           | Purpose                    |
| ----------------- | -------------------------- |
| **Monaco Editor** | Diff viewer, code display  |
| **Shiki**         | Syntax highlighting themes |
| **react-syntax-highlighter** | Animated code blocks |

## 18. Code Editor Enhancements

### 18.1 Animated Code Block

```typescript
// components/code/animated-code-block.tsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function AnimatedCodeBlock({ code, language }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Gradient border glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000" />
      
      <div className="relative bg-[#1e1e1e] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
          <span className="text-sm text-gray-400">{language}</span>
          <CopyButton code={code} />
        </div>
        
        {/* Code */}
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent'
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
}
```

### 18.2 Interactive Diff Viewer with Slider

> Status: Experimental (Non-MVP)  
> This feature must not replace or interfere with the standard Monaco Diff Viewer used in the Diff Modal.

```typescript
// components/diff/interactive-diff-viewer.tsx
export function InteractiveDiffViewer({ before, after }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  
  return (
    <div className="relative h-96 rounded-lg overflow-hidden border">
      {/* Before (left side) */}
      <div 
        className="absolute inset-0 bg-red-500/10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <MonacoEditor
          value={before}
          language="typescript"
          theme="vs-dark"
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
      
      {/* After (right side) */}
      <div 
        className="absolute inset-0 bg-green-500/10"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <MonacoEditor
          value={after}
          language="typescript"
          theme="vs-dark"
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
      
      {/* Slider control */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
        <div 
          className="relative w-full h-full"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-auto cursor-ew-resize" />
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 z-20"
      />
    </div>
  );
}
```

## 19. Cinematic Loading States

### 19.1 AI Brain Loader

```typescript
// components/loading/ai-brain-loader.tsx
export function AIBrainLoader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative w-32 h-32"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 border-4 border-purple-500/30 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        
        {/* Inner core with glow */}
        <motion.div
          className="absolute inset-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(59,130,246,0.5)",
              "0 0 40px rgba(147,51,234,0.8)",
              "0 0 20px rgba(59,130,246,0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>
      
      <motion.p
        className="text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        AI is processing...
      </motion.p>
    </div>
  );
}
```

### 19.2 Gradient Progress Bar

```typescript
// components/loading/gradient-progress.tsx
export function GradientProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}
```

### 19.3 Circular Progress with Glow

```typescript
// components/loading/circular-progress.tsx
export function CircularProgress({ progress, size = 120 }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#1f2937"
        strokeWidth="8"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference
        }}
      />
      
      {/* Center text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-2xl font-bold fill-white"
      >
        {progress}%
      </text>
    </svg>
  );
}
```

## 20. Advanced Notification Center

> Restriction:  
> Notifications must only reflect user-initiated actions or system errors.  
> Background or autonomous system activity notifications are prohibited.

### 20.1 Notification Center Component

```typescript
// components/notifications/notification-center.tsx
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'File saved', message: 'main.ts updated successfully', time: '2m ago' },
    { id: 2, type: 'info', title: 'Model switched', message: 'Now using Claude 3.5 Sonnet', time: '5m ago' },
    { id: 3, type: 'warning', title: 'API rate limit', message: 'Approaching rate limit (80%)', time: '10m ago' }
  ]);
  
  return (
    <div className="relative">
      <motion.button
        className="relative p-2 rounded-lg hover:bg-accent"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" />
        
        {/* Badge with pulse animation */}
        {notifications.length > 0 && (
          <>
            <motion.span
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {notifications.length}
            </span>
          </>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="
              absolute top-12 right-0 w-96
              backdrop-blur-xl bg-background/95
              border border-white/10
              rounded-2xl shadow-2xl
              overflow-hidden
              z-50
            "
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button className="text-sm text-primary hover:underline">
                Mark all as read
              </button>
            </div>
            
            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 border-b border-white/5 hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[notification.type]}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          <span className="text-xs text-muted-foreground mt-1 block">{notification.time}</span>
        </div>
      </div>
    </motion.div>
  );
}
```

## 21. Premium Dark Mode Toggle

### 21.1 Smooth Theme Toggle

```typescript
// components/theme/theme-toggle.tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <motion.button
      className="relative w-20 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1"
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
        animate={{ x: theme === 'light' ? 0 : 40 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <Sun className="w-5 h-5 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
            >
              <Moon className="w-5 h-5 text-blue-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
```

## 22. Unique Features

### 22.1 System State Indicator

The system state indicator communicates operational status only.

#### States
- `Thinking` — AI request in progress
- `Offline` — No provider connectivity
- `Ready` — System idle
- `Error` — Action failed

The indicator must not imply confidence, emotion, or intent.

### 22.2 Code Quality Ring

```typescript
// components/code/quality-ring.tsx
export function CodeQualityRing({ quality }: { quality: number }) {
  const circumference = 2 * Math.PI * 40;
  
  const getColor = (q: number) => {
    if (q >= 80) return { from: '#10b981', to: '#34d399' }; // Green
    if (q >= 60) return { from: '#3b82f6', to: '#60a5fa' }; // Blue
    if (q >= 40) return { from: '#f59e0b', to: '#fbbf24' }; // Orange
    return { from: '#ef4444', to: '#f87171' }; // Red
  };
  
  const colors = getColor(quality);
  
  return (
    <svg className="w-32 h-32" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
      </defs>
      
      {/* Background ring */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#1f2937"
        strokeWidth="8"
      />
      
      {/* Progress ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#qualityGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: quality / 100 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)"
        }}
      />
      
      {/* Quality score */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-2xl font-bold fill-white"
      >
        {quality}
      </text>
    </svg>
  );
}
```

### 22.3 Particle Background

> Restriction:  
> Particle backgrounds must be disabled automatically in:
> - Diff Modal
> - Error Modals
> - Settings
> - File Tree
> - Low-performance mode
> - `prefers-reduced-motion`

```typescript
// components/effects/particle-background.tsx
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export function ParticleBackground() {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };
  
  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: { value: "transparent" }
        },
        fpsLimit: 120,
        particles: {
          number: { value: 50, density: { enable: true, value_area: 800 } },
          color: { value: "#3b82f6" },
          shape: { type: "circle" },
          opacity: {
            value: 0.3,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
          },
          size: {
            value: 3,
            random: true,
            anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#3b82f6",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
          },
          modes: {
            grab: { distance: 400, line_linked: { opacity: 1 } },
            bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
          }
        },
        retina_detect: true
      }}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
```

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

## 7. Component Library & Design System

### 7.1 Core Components

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

### 7.2 Specialized Components

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

### 7.3 Animation Guidelines

- **Duration:** Keep animations under 200ms for responsiveness
- **Easing:** Use `ease-out` for entering, `ease-in` for exiting
- **Respect Preferences:** Honor `prefers-reduced-motion`
- **Purpose:** Animations should provide feedback or guide attention
- **Consistency:** Use consistent timing and easing across components

### 7.4 Accessibility Standards

- **WCAG AA Compliance:** All components meet WCAG 2.1 AA standards
- **Keyboard Navigation:** Full keyboard accessibility with logical tab order
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 contrast ratio for text
- **Focus Indicators:** Clear visual focus indicators for all interactive elements

### 7.5 Responsive Design

- **Breakpoints:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Fluid Typography:** Responsive font sizes using clamp()
- **Flexible Layouts:** CSS Grid and Flexbox for adaptive layouts
- **Touch Targets:** Minimum 44px touch targets on mobile
- **Content Priority:** Progressive disclosure on smaller screens

---

## 8. User Experience Flows (Extended)

### 8.1 First-Time Setup Flow

1. **Welcome Screen:** Brief introduction to AIDE capabilities
2. **Provider Configuration:** Add first AI provider with guided setup
3. **Model Selection:** Choose model from fetched list
4. **Workspace Selection:** Select project directory
5. **Quick Tour:** Interactive tutorial of main features
6. **First Chat:** Guided first interaction with AI

### 8.2 Daily Usage Flow

1. **Launch:** App opens to last workspace and provider
2. **Quick Actions:** Command palette for common tasks
3. **File Operations:** Browse, open, and edit files
4. **AI Interaction:** Chat with AI about code
5. **Review Changes:** Approve/reject AI suggestions

### 8.3 Error Recovery Flow

1. **Error Detection:** Clear error messages with context
2. **Suggested Actions:** Actionable steps to resolve issues
3. **Fallback Options:** Alternative approaches when primary fails
4. **Support Resources:** Links to documentation and help
5. **State Recovery:** Restore to last known good state

---

## 9. Implementation Guidelines

### 9.1 Component Development

- Use TypeScript for all components
- Follow React best practices and hooks patterns
- Implement proper error boundaries
- Include comprehensive prop validation
- Write unit tests for all components

### 9.2 Styling Approach

- Use Tailwind CSS utility classes
- Create custom CSS variables for theme tokens
- Implement dark/light mode support
- Use CSS-in-JS sparingly for dynamic styles
- Maintain consistent spacing scale

### 9.3 Performance Considerations

- Lazy load non-critical components
- Implement virtual scrolling for large lists
- Optimize re-renders with React.memo
- Use proper key props for list items
- Monitor bundle size and code splitting

### 9.4 Testing Strategy

- Unit tests for individual components
- Integration tests for user flows
- Visual regression tests for UI consistency
- Accessibility tests with automated tools
- Performance tests for critical paths

---

## 10. Future Enhancements

### 10.1 Advanced Features

- **Plugin System:** Third-party extensions and themes
- **Guided Workflows:** Chat-triggered multi-step UI flows
- **Advanced Analytics:** Code quality metrics and insights
- **Team Management:** Organization-level user and permission management
- **Tool Integration:** External tools surfaced through chat and diff-confirm flow

### 10.2 Platform Expansion

- **Web Version:** Browser-based AIDE for cloud development
- **Mobile Companion:** Mobile app for code review and monitoring
- **VS Code Extension:** Integration with popular editors
- **CLI Tool:** Command-line interface for automation
- **Cloud Sync:** Synchronize settings and workspaces across devices

---

## 11. Accessibility (A11y) Checklist

- [ ] All interactive elements have focus states (`focus:ring-2`).
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1).
- [ ] Images and icons have proper `alt` text or `aria-label`.
- [ ] The diff viewer is navigable via keyboard.
- [ ] Screen reader announcements for critical events (e.g., "Edit proposed", "Changes saved").

## 12. Data Integration & References

- **AI Provider Configurations:** The visual components in this design (Provider Selector, Settings page) pull their data and logic from the technical specifications defined in [`PROVIDERS.md`](./PROVIDERS.md). Specifically: provider templates in Section "Provider Templates (API Configuration Only)", CLI agents in "CLI Agents Integration".
- **Example:** The "Add Provider" form in Section 4.1 is built to populate the configuration schema defined in `PROVIDERS.md`.

---

## Visual Effect Scope Control

Advanced visual effects (glass, neon, gradients, 3D, particles, glow) are restricted to:
- Provider Selector
- Welcome / Onboarding
- Marketing or showcase views

They are prohibited in:
- Diff Modal
- Error Modals
- Settings Forms
- File Tree
- Command Palette
- Code Review Views

> **Note:** Animations and effects are PROHIBITED on Trust Surfaces (diff modals, error states, critical confirmations) per SPECIFICATIONS.md. This ensures code review accuracy and maintains user trust in critical UI interactions.

## Performance Governor

The UI must dynamically degrade visual effects when:
- Average FPS < 55
- Memory usage exceeds budget
- System reports `prefers-reduced-motion`

Degraded mode disables:
- Particles
- 3D transforms
- Glow / neon effects
- Background blur
- Gradient animations

## UI Constitutional Terminology

- **Trust Surfaces** — Diff Modal, Error Modals, Permission Prompts, Settings
- **Decorative Surfaces** — Welcome screen, Provider cards, Marketing UI
- **System State** — Operational status only, not AI intent or emotion
- **User Action** — Any event initiated by explicit user input

---

This UI/UX specification provides comprehensive guidance for implementing AIDE's user interface with a focus on usability, accessibility, and advanced features. All components should be implemented following these guidelines to ensure a consistent and professional user experience.

