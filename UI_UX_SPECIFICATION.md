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
- Right-click context menu: `Open in Chat`, `Reveal in Finder/Explorer`.

### 4.5 Command Palette

The command palette provides keyboard-first navigation for power users.

**Trigger:** `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux)

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
│   📄 Open Workspace...              Cmd+O   │
│   💬 New Conversation              Cmd+N   │
│   ⚙️ Open Settings                 Cmd+,   │
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

| Shortcut               | Action               | Context         |
| ---------------------- | -------------------- | --------------- |
| `Cmd/Ctrl + K`         | Open command palette | Global          |
| `Cmd/Ctrl + O`         | Open workspace       | Global          |
| `Cmd/Ctrl + N`         | New conversation     | Global          |
| `Cmd/Ctrl + ,`         | Open settings        | Global          |
| `Cmd/Ctrl + B`         | Toggle sidebar       | Global          |
| `Cmd/Ctrl + 1-9`       | Switch provider      | Global          |
| `Cmd/Ctrl + Shift + A` | Accept diff          | Diff modal open |
| `Cmd/Ctrl + Shift + R` | Reject diff          | Diff modal open |

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
| React        | 19.x    | UI framework      |
| TypeScript   | 5.5+    | Type safety       |
| Tailwind CSS | 4.0     | Styling           |
| shadcn/ui    | latest  | Component library |

### Enhanced Components

| Library           | Purpose             | Usage                    |
| ----------------- | ------------------- | ------------------------ |
| **CMDK**          | Command palette     | `Cmd+K` navigation       |
| **Sonner**        | Toast notifications | User feedback            |
| **Vaul**          | Drawer component    | Mobile-like panels       |
| **Framer Motion** | Animations          | Micro-interactions       |
| **WebRTC**        | P2P communication   | Voice chat, screen share |

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
6. **Collaboration:** Invite others for real-time editing

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
