import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useProviderStore } from "@/stores/provider-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { getProviderIcon } from "@/lib/provider-icons";
import { 
  FolderIcon, 
  MessageSquare, 
  Settings, 
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, toggleSettings } = useUIStore();
  const { providers, setActiveProvider } = useProviderStore();
  const { setWorkspace } = useWorkspaceStore();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4">
      <Command 
        className="w-full max-w-[640px] bg-popover text-popover-foreground rounded-xl shadow-2xl border overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "Escape") setCommandPaletteOpen(false);
        }}
      >
        <div className="flex items-center border-b px-3 h-12">
          <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Recently Used" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
             {/* Add dynamic recently used here */}
          </Command.Group>

          <Command.Group heading="Actions" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Command.Item 
              onSelect={() => { toggleSettings(); setCommandPaletteOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Open Settings</span>
              <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘,</kbd>
            </Command.Item>
            <Command.Item 
              className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>New Conversation</span>
              <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘N</kbd>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Providers" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-2 border-t pt-2">
            {providers.map((p) => (
              <Command.Item 
                key={p.id} 
                onSelect={() => { setActiveProvider(p); setCommandPaletteOpen(false); }}
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer text-sm"
              >
                <span className="text-lg w-4 flex justify-center">{getProviderIcon(p.type)}</span>
                <span>Switch to {p.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {p.selectedModel || "No model"}
                </span>
              </Command.Item>
            ))}
            <Command.Item 
              onSelect={() => { toggleSettings(); setCommandPaletteOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer text-sm text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Provider...</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
