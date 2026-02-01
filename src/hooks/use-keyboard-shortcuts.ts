import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import type { AIProviderConfig } from '../lib/ai/AIControlPlane';

interface UseKeyboardShortcutsOptions {
  /** Whether the diff modal is currently open */
  isDiffModalOpen?: boolean;
  /** Callback to accept diff changes */
  onAcceptDiff?: () => void;
  /** Callback to reject diff changes */
  onRejectDiff?: () => void;
}

/**
 * Custom hook for handling global keyboard shortcuts
 * 
 * Implements shortcuts per UI_UX_SPECIFICATION.md Section 5.5:
 * - Ctrl+K: Open command palette (handled in Header.tsx)
 * - Ctrl+O: Open workspace
 * - Ctrl+N: New conversation
 * - Ctrl+,: Open settings
 * - Ctrl+B: Toggle sidebar
 * - Ctrl+1-9: Switch provider
 * - Ctrl+Shift+A: Accept diff (when diff modal open)
 * - Ctrl+Shift+R: Reject diff (when diff modal open)
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { isDiffModalOpen, onAcceptDiff, onRejectDiff } = options;
  
  const {
    toggleSidebar,
    setShowSettings,
    setSelectedWorkspace,
    setSelectedProvider,
    aiProviders,
  } = useAppStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Handle diff-specific shortcuts only when modal is open
      if (isDiffModalOpen) {
        if (isMod && isShift && e.key.toLowerCase() === 'a') {
          e.preventDefault();
          onAcceptDiff?.();
          return;
        }

        if (isMod && isShift && e.key.toLowerCase() === 'r') {
          e.preventDefault();
          onRejectDiff?.();
          return;
        }
      }

      // Global shortcuts (only when not in input/textarea)
      const target = e.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isMod && !isShift) {
        switch (e.key.toLowerCase()) {
          case 'o':
            e.preventDefault();
            // Open workspace - trigger file picker dialog
            // In a real Electron app, this would use electron.showOpenDialog
            // For now, we simulate by setting a mock workspace or triggering an event
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.webkitdirectory = true;
            fileInput.addEventListener('change', (event) => {
              const files = (event.target as HTMLInputElement).files;
              if (files && files.length > 0) {
                // Get the first file's path info
                const firstFile = files[0];
                const path = firstFile.webkitRelativePath || firstFile.name;
                const folderName = path.split('/')[0] || 'workspace';
                
                setSelectedWorkspace({
                  id: `ws-${Date.now()}`,
                  name: folderName,
                  path: path,
                });
              }
            });
            fileInput.click();
            break;

          case 'n':
            // New conversation - only trigger if not in input
            if (!isInputElement) {
              e.preventDefault();
              // Dispatch custom event to clear chat
              window.dispatchEvent(new CustomEvent('aide:new-conversation'));
            }
            break;

          case ',':
            // Open settings
            if (!isInputElement) {
              e.preventDefault();
              setShowSettings(true);
            }
            break;

          case 'b':
            // Toggle sidebar
            if (!isInputElement) {
              e.preventDefault();
              toggleSidebar();
            }
            break;
        }

        // Handle Ctrl+1-9 for provider switching
        const match = e.key.match(/^[1-9]$/);
        if (match && !isInputElement) {
          e.preventDefault();
          const index = parseInt(match[0], 10) - 1;
          const providers = Object.values(aiProviders) as AIProviderConfig[];
          if (index < providers.length) {
            setSelectedProvider(providers[index].id);
          }
        }
      }
    },
    [
      isDiffModalOpen,
      onAcceptDiff,
      onRejectDiff,
      toggleSidebar,
      setShowSettings,
      setSelectedWorkspace,
      setSelectedProvider,
      aiProviders,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
