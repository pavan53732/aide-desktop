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
| 5   | **Keyboard-first design**                   | All actions must be accessible via keyboard shortcuts. See Section 5.5.                                    |
| 6   | **No hardcoded provider/model names in UI** | UI components must read from config, never hardcode "GPT-4" or "Claude" in JSX.                            |
| 7   | **Accessibility is mandatory**              | All components must meet WCAG AA standards.                                                                |

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
| React        | 19.x    | UI framework      |
| TypeScript   | 5.7+    | Type safety       |
| Tailwind CSS | 4.0     | Styling           |
| shadcn/ui    | latest  | Component library |

### Enhanced Components

| Library           | Purpose             | Usage                    |
| ----------------- | ------------------- | ------------------------ |
| **CMDK**          | Command palette     | `Cmd+K` navigation       |
| **Sonner**        | Toast notifications | User feedback            |
| **Vaul**          | Drawer component    | Mobile-like panels       |
| **Framer Motion** | Animations          | Micro-interactions       |

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
- **Custom Workflows:** User-defined automation sequences
- **Advanced Analytics:** Code quality metrics and insights
- **Team Management:** Organization-level user and permission management
- **API Integration:** Connect with external development tools

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

This UI/UX specification provides comprehensive guidance for implementing AIDE's user interface with a focus on usability, accessibility, and advanced features. All components should be implemented following these guidelines to ensure a consistent and professional user experience.

